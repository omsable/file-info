const fs = require('fs')
const path = require('path')
const https = require('https')

const Koa = require('koa')
const router = require('koa-router')()
const body = require('koa-json-body')

const { getFileInfo } = require('./handler')

const app = new Koa()
const port = 8080

router.post('/', async (ctx, next) => {
  const { url = '' } = ctx.request.body

  const info = await getFileInfo(url)
  console.log('info', info)
  ctx.body = info
})

router.get('/health', ctx => {
  ctx.body = 'OK'
})

app.use(body())
app.use(router.routes())
app.listen(port)
console.log(`Listening on localhost:${port}`)
