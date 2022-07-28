const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const PORT = process.env.PORT || 3000
const ScrapeController = require('./controllers/scrape.controller')
const ScrapeNewsController = require('./controllers/scrapenews.controller')

app.use(cors())
app.use(helmet())

app.get('/animelist',ScrapeController.animeList)
app.get('/category',ScrapeController.onGoing)
app.get('/detail',ScrapeController.animeDetail)
app.get('/anime',ScrapeController.anime)
app.get('/search',ScrapeController.searchAnime)


//anime news jurnalotaku
app.get('/animenews', ScrapeNewsController.fetchNews)
app.get('/animenews/detail', ScrapeNewsController.fetchDetailNews)

app.listen(PORT, ()=>{
    console.log('Server connected on port'+PORT)
})