// const fetch = require('node-fetch')

// api controller
class API {
    constructor (url) {
        this.url = url
    }

    async getLocation(byip = false, location = '') {
        try {
            let response = await fetch(`${this.url}/${byip ? 'ip' : 'timezone'}/${location ? location : ''}`)
            let data = await response.json()

            return data
        } catch (error) {
            throw new Error('Не удалось получить данные о списке или конкретном часовом поясе. Загляните в код...')
        }
    }
}

// helper controller
class Helper {

    setNode (tagName, params) {
        let node = document.createElement(tagName)

        for (let attr in params.attrs) {
            node.setAttribute(attr, params.attrs[attr])
        }

        params.children ? (params.children.forEach(child => { node.appendChild(child) })) : params.text ? node.innerText = params.text : null

        return node
    }

    setNodeTo (tagName, params, parentNode) {
        parentNode.appendChild(this.setNode(tagName, params))
    }

    getNode (selector) {
        return document.querySelector(selector)
    }
}
const helper = new Helper()

// VIEW
class Watch {
    constructor(props) {
        this.app = document.getElementById(props.app)
    }

    buildSelect() {
        helper.setNodeTo('select', {
            children: [helper.setNode('option', {
                attrs: {
                    'disabled': true
                },
                text: 'Выберите город...'
            })]
        }, this.app)
    }

    buildTime() {
        helper.setNodeTo('time', {
            attrs: {},
            text: new Date().toLocaleTimeString(navigator.language)
        }, this.app)
    }

    buildHFormat() {
        helper.setNodeTo('label', {
            children: [
                helper.setNode('input', {
                    attrs: {
                        'type': 'checkbox',
                        'name': 'hformat',
                        'value': 'h12'
                    }
                })
            ]
        }, this.app)
    }

    init() {
        this.buildSelect()
        this.buildTime()
        this.buildHFormat()
    }
}
const watch = new Watch({app: 'app'}).init()
// build
document.addEventListener('DOMContentLoaded', () => {
    (async () => {
        const api = new API('http://worldtimeapi.org/api')

        try {
            let myTimezone = await api.getLocation(true)
            let areas = await api.getLocation(false, myTimezone.timezone.split('/')[0])
            let format = helper.getNode('input[type=checkbox]:checked') ? true : false

            areas.forEach(area => {
                helper.setNodeTo('option', {
                    attrs: {
                        'value': area
                    },
                    text: area.split('/')[1]
                }, helper.getNode('select'))
            });

            helper.getNode('select').addEventListener('change', async function(){
                let location = await api.getLocation(false, this.value)
                let UTC = new Date().toLocaleString('en-US', {timeZone: location.timezone})
                    UTC = new Date(UTC)

                helper.getNode('time').innerText = UTC.toLocaleTimeString('en-US', {hour12: format})
            });

            setInterval(() => {
                var time = new Date().toLocaleTimeString().split(':');
                    helper.getNode('#hours').setAttribute('style', `fill:#84dbff; transform: rotate(${Number(time[0]) * 360 / 12}deg)`)
                    helper.getNode('#minutes').setAttribute('style', `fill:#f1543f; transform: rotate(${Number(time[1]) * 360 / 60}deg)`)
                    helper.getNode('#seconds').setAttribute('style', `fill:#f1543f; transform: rotate(${Number(time[2]) * 360 / 60}deg)`)
            }, 1000);
    
        } catch (error) {
            throw new Error('В асинхронной конструкции есть ошибка... Проверьте код.')
        }
    })();
})