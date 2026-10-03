import json,sys
source=json.load(sys.stdin)
selected=[]
for run in source.get('runs',[]):
 for result in run.get('results',[]):
  locations=result.get('locations',[])
  if any('tools/repros/composed-shared-fallback.cjs' in location.get('physicalLocation',{}).get('artifactLocation',{}).get('uri','') for location in locations):
   selected.append({key:result[key] for key in ('ruleId','message','locations','codeFlows','relatedLocations') if key in result})
print(json.dumps({'analysisId':1884539322,'results':selected},indent=2))
