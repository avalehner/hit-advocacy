//html elements 
const sendEmailBtn = document.getElementById('send-email-btn')
const nameEl = document.getElementById('full-name')
const streetAddressEl = document.getElementById('address')
const apartmentEl = document.getElementById('apartment')
const cityEl = document.getElementById('city')
const zipEl = document.getElementById('zip')
const emailEl = document.getElementById('email')
const assemblyMemberEl = document.getElementById('user-assembly')
const senateMemberEl = document.getElementById('user-senator')
const letterNameEl = document.getElementById('letter-name')
const letterAddressEl = document.getElementById('letter-address')
const emailContentEl = document.getElementById('email-content')
const emailSubjectEl = document.getElementById('email-subject')
const addressLineEl = document.getElementById('address-line')
const formSubmitModal = document.getElementById('form-submit-modal')
const modalMessage = document.getElementById('modal-message')
const modalClose = document.getElementById('modal-close')
const emailRecipients = document.getElementById('email-recipients')
const userSenatorModal = document.getElementById('user-senator-modal')
const userAssemblyMemberModal = document.getElementById('user-assembly-member-modal')


//store legislator data 
let currentLegislators = null

//update letter with constituent address info

const updateLetterPreview = () => {
  const userName = nameEl.value.trim()
  const streetAddress = streetAddressEl.value.trim()
  const apartment = apartmentEl.value.trim()
  const city = cityEl.value.trim()
  const zip = zipEl.value.trim()

  letterNameEl.textContent = `${userName}`
  letterAddressEl.innerHTML = `
    <p style="margin:0">${streetAddress} ${apartment}</p>
    <p style="margin:0";>${city}, NY,  ${zip}</p>
  `
}

const sendEmails = async () => {
  const userName = nameEl.value.trim()
  const userEmail = emailEl.value.trim()
  const emailContent = emailContentEl.innerHTML
  const emailSubject = emailSubjectEl.textContent

  // const additionalRecipients = [
  //   {
  //     name: 'Kathy Hochul', 
  //     email: 'email', //add email
  //     title: 'Governor', 
  //     type: 'governor'
  //   }, 
  //   {
  //     name: 'Andrea Stewart-Cousins', 
  //     email: 'email', //add email
  //     title: 'Senate Majority Leader', 
  //     type: 'senator'
  //   }, 
  //   {
  //     name: 'Carl Heastie', 
  //     email: 'email', //add email
  //     title: 'Assembly Speaker', 
  //     type: 'assemblymember'
  //   }, 
  //   {
  //     name: 'Shelly Mayer', 
  //     email: 'email', //add email 
  //     title: 'Senate Committee on Education Chair', 
  //     type: 'senator'
  //   }, 
  //   {
  //     name: 'Michael Benedetto', 
  //     email: 'email', //add email 
  //     title: 'Assembly Committee on Education Chair', 
  //     type: 'assemblymember'
  //   }
  // ]

  try {
    console.log('Sending assembly member email...')
    const assemblyRes = await fetch('/api/send-email', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        userEmail: userEmail, 
        userName: userName, 
        recipientEmail: 'avalehner@gmail.com', //update to senator email
        recipientName: `${currentLegislators.assemblymember.first_name} ${currentLegislators.assemblymember.last_name}`,
        recipientType: 'assemblymember', 
        emailSubject: emailSubject, 
        emailContent: emailContent
      })
    })

    if(!assemblyRes.ok) {
      const error = await assemblyRes.json()
      throw new Error(`Test email failed: ${error.error}`)
    }

    console.log('Sending senator email...')
    const senateRes = await fetch('/api/send-email', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        userEmail: userEmail, 
        userName: userName, 
        recipientEmail: 'avalehner@gmail.com', //update to senator email 
        recipientName: `${currentLegislators.senator.first_name} ${currentLegislators.senator.last_name}`,
        recipientType: 'senator', 
        emailSubject: emailSubject, 
        emailContent: emailContent
      })
    })

    if(!senateRes.ok) {
      const error = await senateRes.json()
      throw new Error(`Test email failed: ${error.error}`)
    }

    // for (const recipient of additionalRecipients) {
    //   console.log(`Sending to ${recipient.title}`)

    //   const additionalRes = await fetch('/api/send-email', {
    //   method: 'POST', 
    //   headers: { 'Content-Type': 'application/json' }, 
    //   body: JSON.stringify({
    //     userEmail: userEmail, 
    //     userName: userName, 
    //     recipientEmails: 'avalehner@gmail.com', //update to senator email
    //     recipientName: recipient.name,
    //     recipientType: recipient.type, 
    //     emailSubject: emailSubject, 
    //     emailContent: emailContent
    //   })
    // })


    // if(!additionalRes.ok) {
    //   const error = await additionalRes.json()
    //   console.error(`Failed to send to ${recipient.title}: ${error.error}`)
    // } else {
    //   console.log(`${recipient.title} email sent`)
    // }
  // }
    
    //update modal
    modalMessage.textContent = 'Success! Your letter has been sent to the following representatives:'
    modalClose.classList.remove('hidden')
    emailRecipients.classList.remove('hidden')
    userSenatorModal.textContent = `Senator ${currentLegislators.senator.first_name} ${currentLegislators.senator.last_name}`
    userAssemblyMemberModal.textContent = `Assembly Member ${currentLegislators.assemblymember.first_name} ${currentLegislators.assemblymember.last_name}`
    
    // alert('Success! Your letter has been sent to the following representatives: Governor Kathy Hochul, Senate Mahority Leader Andrea Stewart-Cousins, Assembly Speaker Carl Heastie, Senate Commutte on Educatoin Chair Shelly Mayer, Assembly Committee on Education Chair Michael Benedetto, Your State Senator: Jose Serrano your Assembly Member: Eddie Gibbs')
    console.log('success! your emails have been sent')
  } catch (error) {
    console.error('Error sending emails:', error)
  }
}

const handleFormSubmit = async () => {
  const userName = nameEl.value.trim()
  const userEmail = emailEl.value.trim()
  const streetAddress = streetAddressEl.value.trim()
  const zip = zipEl.value.trim()

  //make sure address and zip both exist
  if (!userName || !userEmail || !streetAddress || !zip) {
    alert('Please fill out all required fields: name, email, address, zip')
    return 
  }

  //email validation 
  if (!userEmail.includes('@')) {
    alert('PLease enter a valid email address')
    return 
  }

  //open loading modal 
  formSubmitModal.classList.remove('hidden')
  sendEmailBtn.disabled = true

  try {
    const fullAddress = `${streetAddress}, ${zip}`

    console.log(fullAddress)
    //call backend api 
    const res = await fetch(`/api/lookup?address=${encodeURIComponent(fullAddress)}`)
    const data = await res.json()

    //check if request was successful 
    if(res.ok) {
      console.log('Success, legislators found:', data)
      currentLegislators = data 

      //update frontend with legislator names
      senateMemberEl.textContent = `Your State Senator: ${data.senator.first_name} ${data.senator.last_name} `
      assemblyMemberEl.textContent = `Your Assembly Member: ${data.assemblymember.first_name} ${data.assemblymember.last_name} `
      addressLineEl.textContent = `Dear Governor Hochul, Senate Majority Leader Stewart-Cousins, and Speaker Heastie, Chair Mayer, Chair Benedetto, Senator ${data.senator.last_name}, Assembly Member ${data.assemblymember.last_name},`
      
      modalMessage.textContent='Sending emails...'

      //call send email function 
      await sendEmails(data)

    } else {
      console.error('error:', data.error)
    }
  } catch (error) {
      console.error(error)
  } finally {
    sendEmailBtn.disabled = false 
  }
}

//event listeners
nameEl.addEventListener('input', updateLetterPreview)
streetAddressEl.addEventListener('input', updateLetterPreview)
apartmentEl.addEventListener('input', updateLetterPreview)
cityEl.addEventListener('input', updateLetterPreview)
zipEl.addEventListener('input' , updateLetterPreview)
sendEmailBtn.addEventListener('click', handleFormSubmit)
modalClose.addEventListener('click', () =>{
  formSubmitModal.classList.add('hidden')
  modalMessage.textContent = 'Looking up representatives...'
  modalClose.classList.add('hidden')
  emailRecipients.classList.add('hidden')
  userSenatorModal.textContent = ''
  userAssemblyMemberModal.textContent = ''
})
