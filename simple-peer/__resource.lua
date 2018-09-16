resource_manifest_version '44febabe-d386-4d18-afbe-5e627f4af937'

ui_page('files/index.html')

export 'NUIWrapper'

client_scripts {
	'modules/nui-wrapper.lua'
}

files {
	'files/index.html',
	'files/simplepeer.min.js'
}
