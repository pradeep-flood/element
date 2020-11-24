;(function() {
	var NEW_LINE = '\n'
	var TAB = '\t'

	var SETUP_SCRIPT_MARKER = '{{SETUP_SCRIPT}}'
	var BROWSER_URL_MARKER = '{{BROWSER_URL}}'
	var TEST_SCRIPT_MARKER = '{{TEST_SCRIPT}}'
	var DO_ACTION_ON_LATEST_WINDOW_MARKER = '{{DO_ACTION_ON_LATEST_WINDOW}}'
	var SWITCH_TO_FRAMES_METHOD_MARKER = '{{SWITCH_TO_FRAMES_METHOD}}'
	var PLUGIN_VERSION_MARKER = '{{PLUGIN_VERSION}}'
	var NO_FRAME = '[]'
	var CLASS_NAME_MARKER = '{{CLASS_NAME}}'
	var TEST_METHOD_NAME_MARKER = '{{TEST_METHOD_NAME}}'

	// DONNOT  use template literal because IE does not support it
	// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals

	var scriptTemplate = '/**' + NEW_LINE
	scriptTemplate += '* The source code was generated by floodElementGenerator.js' + NEW_LINE
	scriptTemplate += '* Copyright: Tricentis Flood' + NEW_LINE
	scriptTemplate += '* Website: https://www.flood.io/' + NEW_LINE
	scriptTemplate += '* Flood Element plugin version: ' + PLUGIN_VERSION_MARKER + NEW_LINE
	scriptTemplate += '*/' + NEW_LINE + NEW_LINE

	scriptTemplate += 'export default () => {' + NEW_LINE

	scriptTemplate += NEW_LINE + TAB + "step('URL Navigation', async browser => {" + NEW_LINE
	scriptTemplate += TAB + TAB + "await browser.visit('{{BROWSER_URL}}')" + NEW_LINE
	scriptTemplate += TAB + '})' + NEW_LINE + NEW_LINE

	scriptTemplate += '{{TEST_SCRIPT}}' + NEW_LINE
	scriptTemplate += NEW_LINE + '  }' + NEW_LINE

	function HeaderGenerator() {
		var map = new Map()

		var importLibraries = ['step', 'TestSettings', 'Until', 'By', 'Device', 'Key']

		var defaultTestSettings = {
			clearCache: true,
			disableCache: true,
			loopCount: -1,
			duration: '-1',
			stepDelay: '8.5s',
			actionDelay: '8.5s',
			waitTimeout: '60s',
			screenshotOnFailure: true,
		}

		this.addLibrary = function(libraryName) {
			map.set(libraryName, true)
		}

		// generate import statement from the map
		this.generate = function() {
			var header = []

			//output import libraries
			header.push(
				'import { ' + Object.values(importLibraries).join(',') + " } from '@flood/element'\n",
			)

			//output Element test settings
			header.push('export const settings: TestSettings = {')
			var test_settings = Object.keys(defaultTestSettings).map(function(key) {
				header.push(TAB + key + ': ' + defaultTestSettings[key] + ',')
			})
			header.push('}')

			return header.join('\n')
		}
	}

	function FloodElementGenerator() {
		this.version = '1.0.0'
		this.supportedProperties = [
			{
				name: 'id',
				displayName: 'ID',
			},
			{
				name: 'css',
				displayName: 'CSS selector',
			},
			{
				name: 'visibleText',
				displayName: 'Visible text',
			},
			{
				name: 'partialVisibleText',
				displayName: 'Partial visible text',
			},
			{
				name: 'xpath',
				displayName: 'xPath',
			},
		]
		var self = this
		var isPropertySupported = function(propertyName) {
			for (var i = 0; i < self.supportedProperties.length; i++) {
				if (self.supportedProperties[i].name === propertyName) {
					return true
				}
			}
			return false
		}

		var headerGenerator = new HeaderGenerator()

		var tabIndent = function(num) {
			var ret = []
			if (num > 0)
				for (var i = 1; i <= num; i++) {
					ret.push(TAB)
				}
			return ret.join('')
		}

		// generate setup script
		var generateSetupScript = function(session, options) {
			appInfo = session.appInfo
			setupScript = ''
			return setupScript
		}

		var generateScriptAction = function(frames, action, waitTime, options, cb) {
			if (action == undefined || action == null) {
				result = {
					success: false,
					script: '//ERROR: Action is undefined',
					error: 'ERROR: Action is undefined',
				}
				if (cb) return cb(result)
				return result
			}

			var success = true
			var script = ''
			var error = undefined

			var selectedPropertyName = action.selectedPropertyName
			var selectedPropertyValue = action.selectedPropertyValue
			var actionMetadata = action.actionMetadata
			var isSendKeyWithoutTarget = action.type === 'keyNative'

			if (isSendKeyWithoutTarget == false && isPropertySupported(selectedPropertyName) == false) {
				script =
					"// ERROR: The plugin does not support to generate script by locator'" +
					selectedPropertyName +
					"'"
				error = "ERROR: cannot generate script for Action: '" + action.description + "'"
				success = false
			} else if (actionMetadata && !actionMetadata.error) {
				var elementValue = actionMetadata.value || ''
				elementValue = elementValue.replace(/\n/gi, '\\n')
				var byStatement = ''
				if (!isSendKeyWithoutTarget) {
					byStatement = 'By.' + selectedPropertyName + '("' + selectedPropertyValue + '")'
				}

				var cleanDescription = action.description || ''
				cleanDescription = cleanDescription.replace(/\'/gi, '')
				cleanDescription = cleanDescription.replace(/\"/gi, '')
				cleanDescription = cleanDescription.replace(/\t/gi, '')

				// generate appropriate script based on action type
				switch (action.type) {
					// Click
					case 'click':
						if (actionMetadata.tagName === 'select') {
							script +=
								"step('" +
								cleanDescription +
								"', async browser => {\n\t\t\tawait browser.wait(Until.elementIsVisible(" +
								byStatement +
								'))\n\t\t\tawait browser.selectByValue(' +
								byStatement +
								', "' +
								elementValue +
								'")\n\n\t\t\tawait browser.takeScreenshot()\n\t\t})\n'
						} else {
							mouseButton = 'MOUSE_LEFT'
							if (actionMetadata.details.mouseButton != null)
								mouseButton = actionMetadata.details.mouseButton.name
							script +=
								"step('" +
								cleanDescription +
								"', async browser => {\n\t\t\tawait browser.wait(Until.elementIsVisible(" +
								byStatement +
								'))\n\t\t\tlet clickElement = await browser.findElement(' +
								byStatement +
								')\n\t\t\tawait clickElement.click()\n\n\t\t\tawait browser.takeScreenshot()\n\t\t})\n'
						}
						break
					// Key
					case 'key':
						script +=
							"step('" +
							cleanDescription +
							"', async browser => {\n\t\t\tawait browser.wait(Until.elementIsVisible(" +
							byStatement +
							'))\n\t\t\tawait browser.clear(' +
							byStatement +
							')\n\t\t\tawait browser.type(' +
							byStatement +
							', "' +
							elementValue +
							'")\n\n\t\t\tawait browser.takeScreenshot()\n\t\t})\n'
						break
					default:
						script = "// ERROR: cannot generate script for action: '" + action.description + "'"
						error =
							"ERROR: cannot generate script for Action which is of type: '" + action.type + "'"
						success = false
						break
				}
			} else {
				script =
					"// ERROR: metadata is invalid, couldn't generate script for action " + action.description
				error = 'ERROR: Metadata of action is not specified'
				success = false
			}
			result = {
				success: success,
				script: script,
				error: error,
			}
			if (cb) return cb(result)
			return result
		}

		this.generateScripts = function(session, options, cb) {
			if (session == null || session.actions == null || session.actions.length === 0) {
				result = {
					success: false,
					script: '// ERROR: there is no action to generate',
					error: 'ERROR: there is no action to generate',
				}
				if (cb) return cb(result)
				return result
			}

			var success = true
			var error = undefined
			var alwaysExecuteActionInLatestWindow = options.alwaysExecuteActionInLatestWindow || false
			// generate setup script
			var setupScript = generateSetupScript(session, options)

			// obtain the script template
			var template = scriptTemplate

			template = template.replace(PLUGIN_VERSION_MARKER, self.version || '')
			// replace the SETUP_SCRIPT_MARKER marker inside template with setupScript
			template = template.replace(SETUP_SCRIPT_MARKER, setupScript)
			template = template.replace(
				DO_ACTION_ON_LATEST_WINDOW_MARKER,
				alwaysExecuteActionInLatestWindow,
			)

			// replace BROWSER_URL_MARKER marker with the url of first action
			template = template.replace(
				BROWSER_URL_MARKER,
				session.actions[0].actionMetadata.browserUrl || '<Enter URL>',
			)
			template = template.replace(CLASS_NAME_MARKER, options.className)
			// this will contain body script
			var bodyScript = []

			// store the active frame, if any, that the user took action on it,
			// the inital value of "[]" means that user did not take action in any frame
			var activeFrame = '[]'

			// if true, we need to generate method to switch to frames

			for (i = 0; i < session.actions.length; i++) {
				var actionIndex = i
				var action = session.actions[i]

				// calculate frame
				var actionFrames = undefined
				if (
					action.type !== 'keyNative' &&
					action.actionMetadata &&
					!action.actionMetadata.popupData &&
					!action.actionMetadata.error
				) {
					// the frame that user took action
					var currentFrame = '[]'
					if (action.actionMetadata.frames) {
						currentFrame = JSON.stringify(action.actionMetadata.frames)
						currentFrame = currentFrame.replace(/"/g, '\\"')
					}
					if (currentFrame !== NO_FRAME && true == alwaysExecuteActionInLatestWindow)
						actionFrames = currentFrame

					// check if the current frame that the action was taken is different from the active frame
					if (activeFrame != currentFrame) {
						// update the active frame to current frame
						activeFrame = currentFrame
						if (!alwaysExecuteActionInLatestWindow) {
							// the action has been taken inside a frame, generate script to switch to the active frame
							bodyScript.push(tabIndent(2) + 'switchToFrames("' + activeFrame + '");')
						}
					}
				}
				//~calculate frame
				generateScriptAction(actionFrames, action, 0, options, function(result) {
					/*
          before obtaining the generated script for current action,
          we need to decide whether or not to switch to a frame if the action has been taken inside it
          */

					// assert whether we are successful
					success = success && result.success

					// and obtain the error, if any
					if (result.error != null) {
						error = result.error + NEW_LINE
					} else {
						// obtain the generated script for the current action
						if (true == options.generateDescriptionAsComment)
							bodyScript.push(
								tabIndent(2) + '/*' + action.description.replace(/\n/gi, '\\n') + '*/',
							)
						bodyScript.push(tabIndent(2) + result.script)
						//bodyScript.push(tabIndent(2) + "Thread.sleep(5000);");
					}
				})
			}

			// replace the TEST_SCRIPT_MARKER marker inside template with bodyScript to
			// obtain test script (or body script)
			template = template.replace(TEST_SCRIPT_MARKER, bodyScript.join(NEW_LINE))

			// we're done generating the scripts, now wrap them up:
			// first, get the import scripts from headerGenerator
			var imports = headerGenerator.generate()

			// merge them together
			//var package = options.packageName? "package " + options.packageName + ";" + NEW_LINE : "";
			var script = imports + NEW_LINE + NEW_LINE + template

			// the result object
			result = {
				success: success,
				script: script,
				error: error,
			}

			// if done callback is specified, invoke it
			if (cb) return cb(result)
			// otherwise, return the function result
			return result
		}
	}

	window.getAutomationScriptGenerator = function() {
		var generator = new FloodElementGenerator()
		return {
			generateScripts: generator.generateScripts,
			supportedProperties: generator.supportedProperties,
			generatedFileExtension: 'ts',
			options: {
				fieldSettings: [
					{
						name: 'className',
						label: 'Class Name',
						defaultValue: 'TestCase1',
					},
					{
						name: 'clearTextBeforeSendingKeys',
						label: 'Clear text before sending keys',
						defaultValue: true,
					},
					{
						name: 'alwaysExecuteActionInLatestWindow',
						label: 'Always execute action in latest window',
						defaultValue: true,
					},
					{
						name: 'generateDescriptionAsComment',
						label: 'Generate action description as code comment',
						defaultValue: false,
					},
				],
			},
		}
	}
})()
//@ sourceURL=floodElementGenerator.js