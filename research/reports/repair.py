import json, subprocess, os, sys
R = os.path.dirname(os.path.abspath(__file__))
PY = os.path.expanduser('~/wrds_project/venv/bin/python3')
forced = set(json.load(open(f'{R}/breaks.json'))) if os.path.exists(f'{R}/breaks.json') else set()
for it in range(8):
    subprocess.run([PY, f'{R}/builder.py', 'assemble'], check=True, cwd=R)
    subprocess.run(['node', f'{R}/checker.cjs'], check=True, cwd=R)
    ov = json.load(open(f'{R}/overflow.json'))
    pm = json.load(open(f'{R}/pagemap.json'))
    bad = []
    for doc in ('h2', 'sg'):
        for i, over in enumerate(ov[doc]):
            if over > 2:
                bids = pm[doc][i] if i < len(pm[doc]) else None
                bad.append((doc, i, over, bids))
    if not bad:
        print(f'iteration {it}: ZERO overflow — clean'); sys.exit(0)
    changed = False
    for doc, i, over, bids in bad:
        print(f'iteration {it}: {doc} page {i+1} overflows {over}px')
        if bids and len(bids) > 1:
            forced.add(bids[-1].split('#')[0]); changed = True   # fragment ids look like h2-16#0:1
        elif bids:
            print(f'  single-block page cannot be split: {bids}')
    if not changed:
        print('no fixable overflow left'); sys.exit(1)
    json.dump(sorted(forced), open(f'{R}/breaks.json', 'w'))
print('max iterations reached'); sys.exit(1)
