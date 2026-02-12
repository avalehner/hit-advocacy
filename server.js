require('dotenv').config() //loads env variables 
const express = require('express') 
const Geocodio = require('geocodio-library-node')
const { Resend } = require('resend')

const app = express() //creates web server app
const PORT = process.env.PORT || 3000 

//initialize geocodio + resend 
const geocoder = new Geocodio(process.env.GEOCODIO_API_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

//serves static files from public folder 
app.use(express.static('public'))
app.use(express.json()) //parse incoming http requests

//Endpoint 1: Get Legislator Data 
app.get('/api/lookup', async (req, res) => {
  const address = req.query.address 

  if (!address) {
    return res.status(400).json({ error: 'Address is required' })
  }

  try {
    console.log('Looking up:', address)

    const data = await geocoder.geocode(address, ['stateleg'])

    const result = data.results[0]
    console.log(result)

    //send back to the frontend 
    res.json({
      assemblymember: {
        title: 'Assembly Member', 
        first_name: result.fields.state_legislative_districts.house[0]?.current_legislators[0].bio.first_name, 
        last_name: result.fields.state_legislative_districts.house[0]?.current_legislators[0].bio.last_name, 
        email: result.fields.state_legislative_districts.house[0]?.current_legislators[0].contact.email, 
        phone: result.fields.state_legislative_districts.house[0]?.current_legislators[0].contact.phone
      }, 
      senator: {
        title: 'Senator', 
        first_name: result.fields.state_legislative_districts.senate[0]?.current_legislators[0].bio.first_name, 
        last_name: result.fields.state_legislative_districts.senate[0]?.current_legislators[0].bio.last_name, 
        email: result.fields.state_legislative_districts.senate[0]?.current_legislators[0].contact.email, 
        phone: result.fields.state_legislative_districts.senate[0]?.current_legislators[0].contact.phone
      } 
    })

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: error.message })
  }
})

//Endpoint 2: Send emails
app.post('/api/send-email', async (req, res) => {

  //extract data from request body 
  const {
    userEmail, 
    userName, 
    recipientEmail, 
    recipientName, 
    recipientType, // 'assembly member' or 'senator'
    emailSubject, 
    emailContent
  } = req.body

  //validate required fields 

  if(!userEmail || !userName || !recipientEmail || !emailContent) {
    return res.status(400).json({
      error: 'Missing required fields', 
      required: ['userEmail', 'userName', 'recipientEmail', 'emailContent']
    })
  }

  //make sure valid email 
  if (!userEmail.includes('@') || !recipientEmail.includes('@')) {
    return res.status(400).json({
      error: 'Invalid email address format'
    })
  }

  try {
    const title = recipientType === 'assemblymember' 
      ? 'Assembly Member'
      : 'Senator'
    
    console.log(`Sending email to ${title} ${recipientName} (${recipientEmail})`)
    console.log(`From constituent: ${userName} (${userEmail})`)

    //send email with resend 
    const { data, error } = await resend.emails.send({
      from: 'HIT Advocacy Coalition - New York <coalition@hitadvocacy.expandedschools.org>', 

      to: recipientEmail, 
      replyTo: userEmail, 
      subject: `${emailSubject}`,   
      html: `${emailContent}`
    })

    //check if resend returned error 
    if (error) {
      console.error ('Resend API Error:', error)
      return res.status(400).json({
        error: 'Failed to send email', 
        details: error.message
      })
    }

    console.log('email sucessfully sent!', data.id)

    res.json({
      success: true, 
      messageId: data.id, 
      recipient: recipientEmail, 
      sentAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('error:', error)
    res.status(500).json({
      error: 'Internal server error', 
      message: error.message
    })
  }
})



//starts web server and makes it wait for and process incoming http requests 
app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`)
  console.log(`Representative Lookup API: http://localhost:${PORT}/api/lookup`)
  console.log(`Send Email API: http://localhost:${PORT}/api/send-email`)
})






