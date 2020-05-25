const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)  //when naming envrionment variable, it is common to use uppercase

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({   //send is an asynchronous process. We can use async with this. And in the user router, we can use await with the sendWelcomeEmail function.
        to:email,
        from:'diptiagarwalf3@gmail.com',
        subject:'Thanks for joining in!',
        text:`Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}
    const sendCancelationEmail=(email,name)=>{
        sgMail.send({
            to:email,
            from:'diptiagarwalf3@gmail.com',
            subject:'Sorry to see you go!',
            text:`Goodbye ${name}, I hope to see you soon.`
        })
    }

    //we are going to export multiple files, which is why we are using an object to export.
    module.exports={
        sendWelcomeEmail,
        sendCancelationEmail
    }
