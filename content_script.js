const getWebpackScript = async () => {
    const targetScript = Array.from(document.querySelectorAll("script")).find(script =>
        script.src.includes("static/chunks/webpack-"));
    return fetch(targetScript.src).then(v => v.text()).catch(error => {
        console.error("Error fetching script content:", error);
        return null;
    });
}

const extractScriptURL = async (webpack) => {
    const regexA = new RegExp(/(\d+):\s*\"ProductPriceHistoryChart\"/g)
    const regexB = new RegExp(`${regexA.exec(webpack)[1]}:\\s*\\"([^\\".]+)\\"`, 'g')
    return `https://static03.galaxus.com/_next/static/chunks/ProductPriceHistoryChart.${regexB.exec(webpack.match(regexB)[1])[1]}.js`
};

const getPriceHistoryScript = async (url) => {
    return fetch(url).then(v => v.text()).catch(error => {
        console.error("Error fetching script content:", error);
        return null;
    });
}

const extractPriceHistoryHash = async (script) => {
    return script.match(/params:\s*{\s*id:\s*"([^"]+)"/)[1];
};

const scriptURL =
    getWebpackScript()
        .then(v => extractScriptURL(v))
        .then(v => getPriceHistoryScript(v))
        .then(v => extractPriceHistoryHash(v))
        .then(v => `/graphql/o/${v}/priceChartQuery`)

const convertProductID = (productID) => btoa(`Product\nd${productID}:1:406802`);


const fetchPriceHistory = async (productID, apiUrl) => {
    const now = new Date().toISOString();
    const data = document.getElementById('__NEXT_DATA__').innerText
    const client_version = RegExp(/\"x-dg-graphql-client-version\":\s*\"([^"]+)\"/g).exec(data)[1]
    const xpid = RegExp(/\"x-dg-xpid\":\s*\"([^"]+)\"/g).exec(data)[1]
    const correlation_id = RegExp(/\"x-dg-correlation-id\":\s*\"([^"]+)\"/g).exec(data)[1]
    const olderThan3MonthTimestamp_helper = new Date()
    olderThan3MonthTimestamp_helper.setMonth(olderThan3MonthTimestamp_helper.getMonth() - 3);
    const olderThan3MonthTimestamp = olderThan3MonthTimestamp_helper.toISOString();
    //RegExp(/\"olderThan3MonthTimestamp\":\s*\"([^"]+)\"/g).exec(data)[1]
    const payload = {
        variables: {
            id: convertProductID(productID),
            olderThan3MonthTimestamp: olderThan3MonthTimestamp,
            historyFrom: null //olderThan3MonthTimestamp
        }
    };
    return fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-dg-correlation-id": correlation_id,
            "x-dg-graphql-client-name": "isomorph",
            "x-dg-graphql-client-version": client_version,
            "x-dg-language": "de-CH",
            "x-dg-portal": "25",
            "x-dg-routename": "/productDetail",
            "x-dg-routeowner": "isotopes",
            "x-dg-scrumteam": "Isotopes",
            "x-dg-team": "isotopes",
            "x-dg-xpid": xpid
        },
        body: JSON.stringify(payload)
    }).then(v => v.json()).catch(error =>
        console.error("Error fetching price history:", error))
};

function median(numbers) {
    const sorted = Array.from(numbers).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2;
    return sorted[middle];
}

function getPercentileValue(numbers, percentile) {
    const sorted = Array.from(numbers).sort((a, b) => a - b);
    const index = Math.ceil((percentile) * sorted.length) - 1;
    return sorted[index];
}

const langRegex = /https?:\/\/[www\.]*[a-z]+\.ch\/([a-zA-Z]{2,})\//
const lang = langRegex.exec(window.location.href)[1]
const genPriceHTML = (v) => `${Math.round(v * 100) / 100}${Math.round(v) == v ? '.-' : ''}`
const priceStringLocale = { 'de': 'war', 'en': 'was', 'fr': 'avant', 'it': 'era' }
const getPriceString = () => priceStringLocale[lang]
const getProductIdFromURL = (url) => {
    const lastPart = url.substring(url.lastIndexOf("/") + 1);
    const productID = lastPart.substring(lastPart.lastIndexOf("-") + 1);
    return productID
}

const handleCurrentProduct = async () => {
    scriptURL
        .then(url => fetchPriceHistory(getProductIdFromURL(window.location.pathname), url))
        .then(v => {
            const currPrice = v.data.productById.price.amountInclusive
            const priceList = v.data.productById.priceHistory.points.filter(v => v.price).map(v => v.price.amountInclusive)
            const minPrice = getPercentileValue(priceList, 0.1);//Math.min(...priceList)

            const priceIndicator = document.createElement('span')
            priceIndicator.classList = "yhSYYIi5 yKEoTuX"
            priceIndicator.innerHTML = `
            <strong>
                <button class="yKEoTuX6">${genPriceHTML(currPrice)}</button>
            </strong>
            <span class="yKEoTuX4 yKEoTuX2">${getPriceString()} 
                ${genPriceHTML(minPrice)}
            </span>`
            {
                const element = document.getElementsByClassName('productDetail')[0]
                const divElem = element.querySelector(':scope > div');
                const spanElem = divElem.querySelector(':scope > span');
                spanElem.style.display = 'none';
                divElem.insertBefore(priceIndicator.cloneNode(true), spanElem)
            }
            {
                const element = document.getElementsByClassName('ysCboot1')[0]
                const divElem = element.querySelector(':scope > div');
                const spanElem = divElem.querySelector(':scope > span');
                spanElem.style.display = 'none';
                divElem.insertBefore(priceIndicator.cloneNode(true), spanElem)
            }

        }).catch(e => { })
}

const handleBrowse = () => {

}

const handleCart = () => {
    scriptURL.then(url => {
        const list = document.getElementById('pageContent').querySelector('section > ul').children
        for (let e of list) {
            fetchPriceHistory(getProductIdFromURL(e.querySelector('a').href.split('?')[0]), url).then(v => {
                const currPrice = v.data.productById.price.amountInclusive
                const priceList = v.data.productById.priceHistory.points.filter(v => v.price).map(v => v.price.amountInclusive)
                const minPrice = getPercentileValue(priceList, 0.1);//Math.min(...priceList)

                const target = e.querySelector('div > div:nth-of-type(2) > div')
                const interactTarget = target.querySelector('div:nth-of-type(1) > button') || target.querySelector('div:nth-of-type(1) > input')
                const getQuantity = (target) => {
                    let a = target.querySelector('div:nth-of-type(1) > button')
                    if (a && a.getAttribute('title')) return parseInt(a.getAttribute('title').match(/\d+/)[0])
                    b = target.querySelector('div:nth-of-type(1) > input')
                    if (b && b.getAttribute('value')) return parseInt(b.getAttribute('value'))
                    return 0
                }
                const amount = getQuantity(target)
                const priceIndicator = document.createElement('div')
                priceIndicator.classList = ""
                priceIndicator.innerHTML = `
                <b>${genPriceHTML(currPrice * amount)}</b>
                <small class="">${getPriceString()} 
                  ${genPriceHTML(minPrice * amount)}
                </small>`
                target.querySelector('div:nth-of-type(2)').style.display = 'none';
                target.appendChild(priceIndicator)
                const observer = new MutationObserver((_) => {
                    const amount = getQuantity(target)
                    priceIndicator.innerHTML = `
                        <b>${genPriceHTML(currPrice * amount)}</b>
                        <small class="">${getPriceString()} 
                        ${genPriceHTML(minPrice * amount)}
                        </small>`
                    const newInteractTarget = target.querySelector('div:nth-of-type(1) > button') || target.querySelector('div:nth-of-type(1) > input')
                    if (newInteractTarget != interactTarget)
                        observer.observe(newInteractTarget, { attributes: true });
                });
                observer.observe(interactTarget, { attributes: true });
            }).catch(e => console.error(e))
        }
    });
}

const handleCompare = () => {

}

const productRegex = /https?:\/\/[www\.]*[a-z]+\.ch\/[a-zA-Z]{2,}\/[a-zA-Z0-9-]+\/product\//
const cartRegex = /https?:\/\/[www\.]*[a-z]+\.ch\/[a-zA-Z]{2,}\/cart/
const compareRegex = /https?:\/\/[www\.]*[a-z]+\.ch\/[a-zA-Z]{2,}\/comparison\//



const refreshFunction = () => {
    if (false);
    else if (productRegex.test(window.location.href)) handleCurrentProduct();
    else if (cartRegex.test(window.location.href)) handleCart();
    else if (compareRegex.test(window.location.href)) handleCompare();
    else;
}

var currentUrl = '';
setInterval(() => {
    if (currentUrl !== window.location.href)
        refreshFunction().then(_ => {
            currentUrl = window.location.href;
        });
}, 500);
