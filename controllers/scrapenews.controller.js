const fetch = require('isomorphic-fetch')
const cheerio = require('cheerio');
const { json } = require('express/lib/response');

const BASE_URL = 'http://jurnalotaku.com/'
// const BASE_URL = 'https://amhmagz.com/'
// const BASE_URL = 'https://animenewsplus.net/'


module.exports = {

    fetchNews: async (req, res) => {
        const resp = await fetch(`${BASE_URL}/all`);
        // console.log(resp);
        try {
            const HOST_NAME = `http://${req.headers.host}`

            if (resp.status >= 400) {

                res.json({
                    status: resp.status,
                    message: resp.statusText
                })
            } else {

                const text = await resp.text();
                const $ = cheerio.load(text);

                let jsonData = [];
                $('body > div#content > div.paper-wrapper > div.paper-main > div.paper-main-top > div.paper-main-wrapper > div.section-wrapper > div.section-content > div.article-wrapper').each(function (i, e) {
                    const $e = $(e);
                    jsonData.push({});
                    jsonData[i].title = $e.find("div.article-inner-wrapper > div.meta > a.title > h3 > span").text();
                    jsonData[i].posted_date = $e.find("div.article-inner-wrapper > div.meta > div.info > span.datetime").text();
                    jsonData[i].linkOrigin = $e.find("div.article-inner-wrapper > a").attr('href');
                    jsonData[i].linkUrl = `${HOST_NAME}/animenews/detail?slug=` + $e.find("div.article-inner-wrapper > a").attr('href').replace(/^.*\/\/[^\/]*/, '').replace('/', '');
                    jsonData[i].summary = $e.find("div.article-inner-wrapper > div.meta > div.summary").text().replace(/^\s+|\s+$|\s+(?=\s)/g, "");
                    jsonData[i].imgUrl = $e.find("div.article-inner-wrapper > div.cover.size-a.has-depth > img").attr('src');
                });
                // console.log($('body').text());
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
                res.json({
                    data: jsonData
                });
            }

        } catch (e) {
            res.status(500).json({
                message: e
            })

        }
    },

    fetchDetailNews: async (req, res) => {
        // console.log(req.headers.host)
        const HOST_NAME = `http://${req.headers.host}`
        const resp = await fetch(`${BASE_URL}${req.query.slug}`)
        const text = await resp.text()
        const $ = cheerio.load(text)
        // console.log(resp);

        try {
            if (res.status >= 400) return res.json({ status: resp.status, message: resp.statusText })
            let jsonData = {}
            // $content = $(`body.paper-layout > div#content`).text()
            // console.log();

            jsonData.header = $(`body.paper-layout > div#content > div.paper-wrapper-full > div.paper-main-full > div.paper-main-full-wrapper > div.section-wrapper > div.meta-info > div.title > h1 > span`).text();
            jsonData.posted_date = $(`body.paper-layout > div#content > div.paper-wrapper-full > div.paper-main-full > div.paper-main-full-wrapper > div.section-wrapper > div.meta-info > div.datetime`).text();

            //create categories
            jsonData.categories = [];
            $(`body.paper-layout > div#content > div.paper-wrapper-full > div.paper-main-full > div.paper-main-full-wrapper > div.section-wrapper > div.meta-info > div.category-wrapper > a.category`)
                .each(function (i, e) {
                    const $e = $(e);
                    jsonData.categories.push({})

                    jsonData.categories[i].name = $e.text()
                    jsonData.categories[i].linkOrigin = $e.attr('href')
                    jsonData.categories[i].linkUrl = `${HOST_NAME}/animenews/category?slug=` + $e.attr('href').replace(/^.*\/\/[^\/]*/, '').replace('/', '')
                });

            //artikel
            jsonData.article = $(`body.paper-layout > div#content > div.paper-wrapper > div.paper-main > div.paper-main-top`).text()
            // console.log(jsonData)
            return res.json({
                data: jsonData
            })

        } catch (e) {
            console.log(e)
            res.status(500).json({
                message: e
            })

        }
    }
}