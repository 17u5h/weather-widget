function templateEngine(block) {
	if ((block === undefined) || (block === null) || (block === false)) {
		return document.createTextNode('')
	}
	if ((typeof block === 'string') || (typeof block === 'number') || (block === true)) {
		return document.createTextNode(block)
	}
	if (Array.isArray(block)) {
		const fragment = document.createDocumentFragment()
		block.forEach(item => {
			const elem = templateEngine(item)
			fragment.appendChild(elem)
		})
		return fragment
	}

	const element = document.createElement(block.tag)

	if (block.cls) {
		element.classList.add(...[].concat(block.cls).filter(Boolean))
	}

	if (block.attrs) {
		const keys = Object.keys(block.attrs)

		keys.forEach(key => {
			element.setAttribute(key, block.attrs[key])
		})
	}

	const content = templateEngine(block.content)

	element.appendChild(content)

	return element
}

const container = document.querySelector('.container')

container.appendChild(templateEngine())