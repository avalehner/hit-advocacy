//html elements 
const findRepsBtn = document.getElementById('find-representatives-btn')
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
const letterAddressLineEl = document.getElementById('address-line')
const formSubmitModal = document.getElementById('form-submit-modal')
const modalClose = document.getElementById('modal-close')
const userSenatorModal = document.getElementById('user-senator-modal')
const userAssemblyMemberModal = document.getElementById('user-assembly-member-modal')
const sendEmailButtonSenator = document.getElementById('send-email-btn-senator')
const sendEmailButtonAssembly = document.getElementById('send-email-btn-assembly')
const userAssemblyModalContainer = document.getElementById('user-assembly-modal-container')
const userSenatorModalContainer = document.getElementById('user-senator-modal-container')
const userSenatorModalMessage = document.getElementById('user-senator-modal-message')
const userAssemblyModalMessage = document.getElementById('user-assembly-modal-message')


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

nameEl.addEventListener('input', updateLetterPreview)
streetAddressEl.addEventListener('input', updateLetterPreview)
apartmentEl.addEventListener('input', updateLetterPreview)
cityEl.addEventListener('input', updateLetterPreview)
zipEl.addEventListener('input' , updateLetterPreview)

const findLegislators = async () => {
  const userSenatorModal = document.getElementById('user-senator-modal')
  const userAssemblyMemberModal = document.getElementById('user-assembly-member-modal')
  const userName = nameEl.value.trim()
  const userEmail = emailEl.value.trim()
  const streetAddress = streetAddressEl.value.trim()
  const zip = zipEl.value.trim()
  const city = cityEl.value.trim()

  //make sure address and zip both exist
  if (!userName || !userEmail || !streetAddress || !zip || !city) {
    alert('Please fill out all required fields: name, email, address, city, zip.')
    return 
  }

  //email validation 
  if (!userEmail.includes('@')) {
    alert('PLease enter a valid email address')
    return 
  }

  //open loading modal 
  formSubmitModal.classList.remove('hidden')
  findRepsBtn.disabled = true

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
    
      //update modal 
      userSenatorModal.textContent = `${data.senator.first_name} ${data.senator.last_name}`
      userAssemblyMemberModal.textContent = `${data.assemblymember.first_name} ${data.assemblymember.last_name}`
      formSubmitModal.classList.remove('hidden')

    } else {
      console.error('error:', data.error)
    }
  } catch (error) {
      console.error(error)
  } finally {
    findRepsBtn.disabled = false 
  }
}

const sendSenateEmail = async () => {
  const userName = nameEl.value.trim()
  const userEmail = emailEl.value.trim()
  letterAddressLineEl.textContent = `Dear Senator ${currentLegislators.senator.first_name} ${currentLegislators.senator.last_name},`
  const emailContent = document.getElementById('email-content').innerHTML
  const emailSubject = document.getElementById('email-subject').textContent

  try {
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
    
    //update modal
    userSenatorModalMessage.innerHTML = `
      <p>Your email has been sent to Senator ${currentLegislators.senator.first_name} ${currentLegislators.senator.last_name}.
      Their office phone number is <span style="font-weight: 700;
      color: #6B2D5C;">${currentLegislators.senator.phone}</span>. Please give the office a call to advocate for HIT funding</p>`
      sendEmailButtonSenator.classList.add('hidden')

    console.log(`success! your email has been sent to Senator ${currentLegislators.senator.first_name} ${currentLegislators.senator.last_name}`)
  } catch (error) {
    console.error('Error sending senator email:', error)
  }
}

const sendAssemblyEmail = async () => {
  const userName = nameEl.value.trim()
  const userEmail = emailEl.value.trim()
  letterAddressLineEl.textContent = `Dear Assembly Member ${currentLegislators.assemblymember.first_name} ${currentLegislators.assemblymember.last_name}, `
  const emailContent = document.getElementById('email-content').innerHTML
  const emailSubject = document.getElementById('email-subject').textContent

  letterAddressLineEl.textContent = `Dear Assembly Member ${currentLegislators.assemblymember.first_name} ${currentLegislators.assemblymember.last_name}, `

  try {
    console.log('Sending Assembly Member email...')
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
    
    //update modal
    userAssemblyModalMessage.innerHTML = `<p>Your email has been sent to Assembly Member ${currentLegislators.assemblymember.first_name} ${currentLegislators.assemblymember.last_name}. Their office phone number is <span style="font-weight: 700;
    color: #6B2D5C;">${currentLegislators.assemblymember.phone}</span>. Please give the office a call to advocate for HIT funding!</p>`
    sendEmailButtonAssembly.classList.add('hidden')

    console.log(`success! your email has been sent to Assembly Member ${currentLegislators.assemblymember.first_name} ${currentLegislators.assemblymember.last_name}`)
  } catch (error) {
    console.error('Error sending Assembly Member email:', error)
  }
}

const resetModal = () => {
  userSenatorModalMessage.innerHTML = `
    <p id="user-senator-modal-message">Your State Senator is <span id="user-senator-modal"></span></p>
  `
  
  userAssemblyModalMessage.innerHTML = `
    <p id="user-assembly-modal-message">Your Assembly Member is <span id="user-assembly-member-modal"></span></p>`

  sendEmailButtonSenator.classList.remove('hidden')
  sendEmailButtonAssembly.classList.remove('hidden')
}

//event listeners
findRepsBtn.addEventListener('click', findLegislators)
sendEmailButtonAssembly.addEventListener('click', sendAssemblyEmail)
sendEmailButtonSenator.addEventListener('click', sendSenateEmail)
modalClose.addEventListener('click', () =>{
  formSubmitModal.classList.add('hidden')
  resetModal()
  userSenatorModal.textContent = ''
  userAssemblyMemberModal.textContent = ''
  letterAddressLineEl.textContent = ''
})
