const Koa = require('koa')
const Router = require('koa-router')
const router = new Router()
const app = new Koa()
const bodyParser = require('koa-bodyparser')
const xmlParser = require('koa-xml-body')
const crypto = require('crypto');
router.get('/wx',async ctx=>{
  const {signature, timestamp, nonce, echostr} = ctx.request.query
  const token = 'weixin'
  if (signature&&timestamp&&nonce&&echostr) { // 微信的请求
    let ori_array = [nonce,token,timestamp]
    let ori_str = ori_array.sort().join('')
    let sha1Code = crypto.createHash("sha1");
    let code = sha1Code.update(ori_str,'utf-8').digest("hex");
    if(code === signature){
      ctx.body = echostr
    }
  }
})
router.post('/wx',async ctx=>{
  console.log('post')
  console.dir(ctx.request.body.xml)
  let req_xml = ctx.request.body.xml
  let res_xml = `
  <xml>
    <ToUserName><![CDATA[${req_xml.FromUserName}]]></ToUserName>
    <FromUserName><![CDATA[${req_xml.ToUserName}]]></FromUserName>
    <CreateTime>${req_xml.CreateTime}</CreateTime>
    <MsgType><![CDATA[${req_xml.MsgType}]]></MsgType>
    <MsgId>${req_xml.MsgId}</MsgId>`
  switch(req_xml.MsgType[0]){
    case 'text':
      ctx.body = res_xml+`<Content><![CDATA[${req_xml.Content}]]></Content></xml>`
      break;
    case 'image':
      ctx.body = res_xml+`<Image><MediaId><![CDATA[${req_xml.MediaId}]]></MediaId></Image></xml>`
      break;
  }
  // console.dir(ctx.response)
})

app.use(xmlParser())
app.use(bodyParser())
app
  .use(router.routes())
  .use(router.allowedMethods());
app.listen(80)