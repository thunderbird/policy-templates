
Copy-Item .\windows\firefox.admx .\windows\thunderbird.admx

((Get-Content -path .\windows\thunderbird.admx -Raw) -creplace 'firefox','thunderbird') | Set-Content -Path .\windows\thunderbird.admx
((Get-Content -path .\windows\thunderbird.admx -Raw) -creplace 'Firefox','Thunderbird') | Set-Content -Path .\windows\thunderbird.admx
((Get-Content -path .\windows\thunderbird.admx -Raw) -creplace '_FF','_TB') | Set-Content -Path .\windows\thunderbird.admx

Set-Location -Path .\windows

Get-ChildItem -Recurse -Directory | ForEach-Object {
	Copy-Item "$($_.FullName)\firefox.adml" "$($_.FullName)\thunderbird.adml"
	((Get-Content -path "$($_.FullName)\thunderbird.adml" -Raw) -creplace 'firefox','thunderbird') | Set-Content -Path "$($_.FullName)\thunderbird.adml"
	((Get-Content -path "$($_.FullName)\thunderbird.adml" -Raw) -creplace 'Firefox','Thunderbird') | Set-Content -Path "$($_.FullName)\thunderbird.adml"
	((Get-Content -path "$($_.FullName)\thunderbird.adml" -Raw) -creplace '_FF','_TB') | Set-Content -Path "$($_.FullName)\thunderbird.adml"
}
