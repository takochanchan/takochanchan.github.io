import json, os, sys, time, urllib.request
from pathlib import Path
req=json.loads(Path('request.json').read_text())[sys.argv[1]]
url='https://api.github.com/repos/'+req['repo']+'/actions/runs?head_sha='+req['sha']
h={'Accept':'application/vnd.github+json','Authorization':'Bearer '+os.environ['GH_TOKEN']}
for _ in range(84):
    try:
        with urllib.request.urlopen(urllib.request.Request(url,headers=h),timeout=25) as r:
            runs=json.load(r)['workflow_runs']
    except OSError:
        time.sleep(8);continue
    match=[x for x in runs if x['name']==req['workflow'] and x['head_sha']==req['sha'] and x['head_branch']=='main']
    if match and match[0]['status']=='completed':
        assert match[0]['conclusion']=='success',match[0]['conclusion']
        print('Deployment verified:',match[0]['id'],req['sha'])
        break
    time.sleep(8)
else:
    raise RuntimeError('Pinned deployment not completed: '+req['sha'])
