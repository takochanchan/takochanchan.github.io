-- Normalize editor-only Word styles into stable EPUB classes and make every
-- heading identifier unique before Pandoc splits the book into XHTML files.

local heading_ids = {}
local heading_serial = 0
local image_serial = 0
local heading_replacements = {
  ["translation_v1_ch06"] = "第1巻第6章",
  ["translation_v1_ch09"] = "第1巻第9章",
  ["translation_v1_notes"] = "第1巻注",
  ["translation_v2_ch19"] = "第2巻第19章",
  ["translation_v2_ch20"] = "第2巻第20章",
  ["translation_v2_toc"] = "第2巻原刊目次",
}

local style_classes = {
  ["Title"] = {"title-style"},
  ["Subtitle"] = {"subtitle-style"},
  ["caption"] = {"figure-caption"},
  ["Quote"] = {"quotation"},
  ["Quotation"] = {"quotation"},
  ["Quoted Text"] = {"quotation", "quoted-text"},
  ["Centered Metadata"] = {"centered-metadata"},
  ["Chapter Kicker"] = {"chapter-kicker"},
  ["Chapter Site"] = {"chapter-site"},
  ["Contents Item"] = {"contents-item"},
  ["Figure"] = {"figure-wrapper"},
  ["Blank Leaf"] = {"blank-leaf"},
  ["Source Page"] = {"source-page", "page-marker"},
  ["Original Page"] = {"source-page", "page-marker"},
  ["Page Marker"] = {"source-page", "page-marker"},
  ["Figure Caption"] = {"figure-caption"},
  ["Plate Caption"] = {"figure-caption", "plate-caption"},
  ["Map Caption"] = {"figure-caption", "map-caption"},
  ["Original Note"] = {"note", "original-note"},
  ["Source Note"] = {"note", "source-note"},
  ["Editorial Note"] = {"note", "editorial-note"},
  ["Translator Note"] = {"note", "translator-note"},
  ["Scope Box"] = {"note", "scope-box"},
  ["Chapter Synopsis"] = {"chapter-synopsis"},
  ["Index Entry"] = {"index-entry"},
  ["Appendix Item"] = {"appendix-item"},
  ["Map Original"] = {"map-original"},
  ["Map Japanese"] = {"map-japanese"},
  ["Plate Original"] = {"plate-original"},
  ["Plate Japanese"] = {"plate-japanese"},
}

function Str(element)
  -- PDF-oriented DOCX masters may contain U+2060 word joiners to protect
  -- Latin names and numbers from line breaking. They are unnecessary in a
  -- reflowable EPUB and otherwise split searchable words and page numbers.
  element.text = element.text:gsub("\226\129\160", "")
  return element
end

local function add_class(element, class_name)
  for _, existing in ipairs(element.classes) do
    if existing == class_name then
      return
    end
  end
  table.insert(element.classes, class_name)
end

local function normalize_custom_style(element)
  local style = element.attributes["custom-style"]
  if style == nil then
    return nil
  end
  local classes = style_classes[style]
  if classes ~= nil then
    for _, class_name in ipairs(classes) do
      add_class(element, class_name)
    end
  end
  return element
end

local function has_class(element, class_name)
  for _, existing in ipairs(element.classes) do
    if existing == class_name then
      return true
    end
  end
  return false
end

local function weak_image_alt(image)
  local alt = pandoc.utils.stringify(image.caption)
  return alt == "" or alt:match("^図[%d０-９]+$") ~= nil
end

local function set_image_alt(block, caption)
  return block:walk({
    Image = function(image)
      if weak_image_alt(image) then
        image.caption = {pandoc.Str(caption)}
      end
      return image
    end,
  })
end

local function short_label(label)
  local length = utf8.len(label)
  return label ~= "" and length ~= nil and length <= 80
end

local function nearby_inline_label(block)
  if block.t ~= "Para" and block.t ~= "Plain" then
    return nil
  end
  local without_images = block:walk({
    Image = function()
      return {}
    end,
  })
  local label = pandoc.utils.stringify(without_images)
  label = label:gsub("　", " ")
  label = label:gsub("^%s+", ""):gsub("%s+$", "")
  label = label:gsub("[：:]%s*$", "")
  if not short_label(label) then
    return nil
  end
  return label
end

function Header(element)
  local replacement = heading_replacements[pandoc.utils.stringify(element.content)]
  if replacement ~= nil then
    element.content = {pandoc.Str(replacement)}
  end
  heading_serial = heading_serial + 1
  if element.identifier == "" then
    element.identifier = string.format("heading-%05d", heading_serial)
  end
  local base = element.identifier
  local count = heading_ids[base] or 0
  heading_ids[base] = count + 1
  if count > 0 then
    element.identifier = base .. "-" .. tostring(count + 1)
  end
  return element
end

function Div(element)
  local style = element.attributes["custom-style"]
  element = normalize_custom_style(element)
  if (
      style == "Source Page"
      or style == "Original Page"
      or style == "Page Marker"
    )
    and #element.content == 1
    and element.content[1].t == "Div"
  then
    element.content = element.content[1].content
  end
  return element
end

function Span(element)
  return normalize_custom_style(element)
end

local function label_inline_images(element)
  local segment = {}
  for _, inline in ipairs(element.content) do
    if inline.t == "Image" then
      local label = pandoc.utils.stringify(segment)
      label = label:gsub("　", " ")
      label = label:gsub("^%s+", ""):gsub("%s+$", "")
      label = label:gsub("[：:]%s*$", "")
      if short_label(label) and weak_image_alt(inline) then
        inline.caption = {pandoc.Str(label)}
        add_class(inline, "inline-illustration")
      end
      segment = {}
    else
      table.insert(segment, inline)
    end
  end
  return element
end

function Para(element)
  element = label_inline_images(element)
  local text = pandoc.utils.stringify(element)
  local marker_text = text:gsub("\194\160", " "):gsub("\226\129\160", "")
  if marker_text:match("^〔原刊%s+[pf]%.%s*.+〕$") ~= nil then
    return pandoc.Div(
      {element},
      pandoc.Attr("", {"source-page", "page-marker"}, {})
    )
  end
  return element
end

function Plain(element)
  return label_inline_images(element)
end

function Blocks(blocks)
  local caption_classes = {
    ["figure-caption"] = 1,
    ["plate-japanese"] = 2,
    ["map-japanese"] = 2,
    ["chapter-kicker"] = 3,
  }
  for index = 1, #blocks do
    local best_caption = nil
    local best_score = 999
    for distance = 1, 3 do
      for _, candidate_index in ipairs({index - distance, index + distance}) do
        local candidate = blocks[candidate_index]
        if candidate ~= nil and candidate.t == "Div" then
          for class_name, priority in pairs(caption_classes) do
            if has_class(candidate, class_name) then
              local caption = pandoc.utils.stringify(candidate)
              local score = priority * 10 + distance
              if caption ~= "" and score < best_score then
                best_caption = caption
                best_score = score
              end
            end
          end
        end
      end
    end
    if best_caption ~= nil then
      blocks[index] = set_image_alt(blocks[index], best_caption)
    end
    local inline_label = nearby_inline_label(blocks[index])
    if inline_label ~= nil then
      blocks[index] = set_image_alt(blocks[index], inline_label)
    end
  end

  for index, block in ipairs(blocks) do
    blocks[index] = block:walk({
      Image = function(image)
        if weak_image_alt(image) then
          image_serial = image_serial + 1
          image.caption = {
            pandoc.Str(string.format("資料図版 %d", image_serial)),
          }
        end
        return image
      end,
    })
  end
  return blocks
end
