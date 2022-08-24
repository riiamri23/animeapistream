const fetch = require("isomorphic-fetch");
const cheerio = require("cheerio");
const { json } = require("express/lib/response");
const { attr } = require("cheerio/lib/api/attributes");

const BASE_URL = "http://komikindo.id/";

module.exports = {
    fetchManga: async (req, res) => {
        const resp = await fetch(`${BASE_URL}komik-terbaru`);

        try {
            const HOST_NAME = `http://${req.headers.host}`;
            console.log(res);
            if (resp.status >= 400) {
                res.json({
                    status: resp.status,
                    message: resp.statusText,
                    error: resp
                });
            } else {
                const text = await resp.text();
                const $ = cheerio.load(text);

                let jsonData = [];
                $('body > main > #wrap > #content > .postbody > .whites > .widget-body > .content > .film-list > .listupd > .animepost').each(function(i, e){
                    const $e = $(e);

                    jsonData.push({});
                    jsonData[i].title = $e.find('div > .bigor > a > div').text();
                    jsonData[i].linkOrigin = $e.find("div > a").attr('href');
                    jsonData[i].linkUrl = `${HOST_NAME}/manga/detail?slug=` + $e.find("div > a").attr('href').replace(/^.*\/\/[^\/]*/, '').replace('/komik/', '').replace('/', '');
                    jsonData[i].slug = $e.find("div > a").attr('href').replace(/^.*\/\/[^\/]*/, '').replace('/komik/', '').replace('/', '');
                    jsonData[i].imgUrl = $e.find('div > a > div > img').attr('src');
                    jsonData[i].lastChapter = $e.find('div > .bigor > div > div > a').text();
                    jsonData[i].linkChapter = `${HOST_NAME}/manga/watcher?slug=` + $e.find('div > .bigor > div > div > a').attr('href').replace(/^.*\/\/[^\/]*/, '').replace('/komik/', '').replaceAll('/', '');
                })
                res.setHeader("Content-Type", "text/html");
                res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
                res.json({
                    data: jsonData,
                });
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: e,
                error: 500
            });
        }
    },
    fetchMangaDetail: async (req, res)=>{

    const resp = await fetch(`${BASE_URL}komik/${req.query.slug}`);

    try {
        const HOST_NAME = `http://${req.headers.host}`;

        if (resp.status >= 400) {
            res.json({
                status: resp.status,
                message: resp.statusText,
                error: 400
            });
        } else {
            const text = await resp.text();
            const $ = cheerio.load(text);

            let jsonData = {};

            jsonData.imgUrl = $(`body > main > #wrap > #content > main > .postbody > article > .whites > .infoanime > .thumb > img`).attr('src');
            jsonData.linkChapAwal = `${HOST_NAME}/manga/watcher?slug=` +  $(`body > main > #wrap > #content > main > .postbody > article > .whites > .infoanime > .epsbaru > .epsbr > a`).attr('href').replace(/^.*\/\/[^\/]*/, '').replaceAll('/', '');
            jsonData.linkChapBaru = `${HOST_NAME}/manga/watcher?slug=` +  $(`body > main > #wrap > #content > main > .postbody > article > .whites > .infoanime > .epsbaru > .epsbr:nth-child(2) > a`).attr('href').replace(/^.*\/\/[^\/]*/, '').replaceAll('/', '');
            jsonData.rating = {
                value: $(`body > main > #wrap > #content > main > .postbody > article > .whites > .infoanime > .thumb > .rt > .ratingmanga > .rtg > .archiveanime-rating > i`).text(),
                votesCount: $(`body > main > #wrap > #content > main > .postbody > article > .whites > .infoanime > .thumb > .rt > .ratingmanga > .rtg > .archiveanime-rating > .archiveanime-rating-content > .votescount`).text()
            };
            jsonData.description = {};
            $(`body > main > #wrap > #content > main > .postbody > article > .whites > .infoanime > .infox > .spe > span`).each(function(i, e){
                const $e = $(e).text().split(":");
                const key = $e[0]
                const val = $e[1]
                
                jsonData.description[key] = val;
            });
            jsonData.genres = [];
            $(`body > main > #wrap > #content > main > .postbody > article > .whites > .infoanime > .infox > .genre-info > a`).each(function(i, e){
                const $e = $(e);
                jsonData.genres.push({});
                jsonData.genres[i].tag = $e.text();
                jsonData.genres[i].link = $e.attr('href');
            });

            jsonData.mangaList = [];
            $(`body > main > #wrap > #content > main > .postbody > article > section:nth-child(3) > .eps_lst > .listeps > #chapter_list > ul > li`).each(function(i, e){
                const $e = $(e);
                jsonData.mangaList.push({});

                jsonData.mangaList[i].chapter = $e.find(".lchx > a").text();
                jsonData.mangaList[i].linkWatch = `${HOST_NAME}/manga/watcher?slug=` + $e.find(".lchx > a").attr('href').replace(/^.*\/\/[^\/]*/, '').replaceAll('/', '');
                jsonData.mangaList[i].linkDownload = `https://komikindo.id` + $e.find(".dl > a").attr('href');
                jsonData.mangaList[i].slug = $e.find(".lchx > a").attr('href').replace(/^.*\/\/[^\/]*/, '').replaceAll('/', '');

            });

            res.setHeader("Content-Type", "text/html");
            res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
            res.json({
                data: jsonData,
            });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: e,
            error: 500
        });
    }
    },
    fetchMangaWatcher: async(req, res)=>{

        const resp = await fetch(`${BASE_URL}${req.query.slug}`);

        try {
            const HOST_NAME = `http://${req.headers.host}`;

            if (resp.status >= 400) {
                res.json({
                    status: resp.status,
                    message: resp.statusText,
                    error: 400
                });
            } else {
                const text = await resp.text();
                const $ = cheerio.load(text);

                let jsonData = {};

                jsonData.img = [];
                $(`body > main > #wrap > #content > .postbody > article > .chapter-area > .chapter-content > .chapter-image > .imgch > #chimg-auh > img`).each(function(i,e){
                    const $e = $(e);
                    jsonData.img.push();

                    jsonData.img[i] = $e.attr('src');
                })

                res.setHeader("Content-Type", "text/html");
                res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
                res.json({
                    data: jsonData,
                });
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: e,
                error: 500
            });
        }
    }
    
};
