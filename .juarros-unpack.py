import gzip, hashlib, json, pathlib, tarfile, zipfile
q=json.loads(pathlib.Path('.juarros-public-request.json').read_text())
root=pathlib.Path('juarros-stage'); root.mkdir(exist_ok=True)
bundle=root/'public.tar.gz'
with bundle.open('wb') as out:
    for part in q['parts']:
        data=pathlib.Path(part['path']).read_bytes()
        assert len(data)==part['size']
        assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==part['sha']
        out.write(data)
assert bundle.stat().st_size==q['bundle']['size']
assert hashlib.sha256(bundle.read_bytes()).hexdigest()==q['bundle']['sha256']
with gzip.open(bundle,'rb') as stream:
    while stream.read(1048576): pass
with tarfile.open(bundle) as tar:
    assert {x.name for x in tar.getmembers()}=={x['filename'] for x in q['assets']}
    assert all(x.isfile() and pathlib.PurePosixPath(x.name).name==x.name for x in tar.getmembers())
    tar.extractall(root,filter='data')
for a in q['assets']:
    p=root/a['filename']
    assert p.stat().st_size==a['size'] and hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256']
epub=next(root.glob('*.epub'))
with zipfile.ZipFile(epub) as archive:
    assert archive.testzip() is None
    assert all(not pathlib.PurePosixPath(x).is_absolute() and '..' not in pathlib.PurePosixPath(x).parts for x in archive.namelist())
    archive.extractall(root/'epub')
print(json.dumps({'assets_verified':q['assets']},ensure_ascii=False))
