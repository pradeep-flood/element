import { step, TestSettings, Until, By, Device, Key } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	clearCache: false,
	disableCache: false,
	clearCookies: false,
	loopCount: -1,
	duration: '-1',
	actionDelay: '2s',
	stepDelay: '2s',
	waitTimeout: '60s',
	screenshotOnFailure: true,
	DOMSnapshotOnFailure: true,
}

/**
 * Author: Antonio Jimenez : antonio@flood.io
 * The internet - heroku App
 * @version 1.1
 */

const URL = 'https://the-internet.herokuapp.com'

export default () => {
	step('Test: 01 - Homepage', async browser => {
		await browser.visit(URL)
		await browser.wait(Until.elementIsVisible(By.css('#content > h1')))
		let pageTextVerify = By.visibleText('Welcome to the-internet')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 02 - Typos', async browser => {
		await browser.visit(URL + '/typos')
		await browser.wait(Until.elementIsVisible(By.css('#content > div > h3')))
		let pageTextVerify = By.visibleText('Typos')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 03 - Typo exist?', async browser => {
		let pageTextVerify = By.visibleText('won,t.')
		let Text = await browser.maybeFindElement(pageTextVerify)
		if (Text != null) {
			console.log('Text won,t found')
		} else {
			console.log("Text won't found")
		}
	})
}
