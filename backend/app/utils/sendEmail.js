const { Resend } = require("resend");

const sendEmail = async (option) => {
 
  const resend = new Resend(process.env.RESEND_API_KEY);

 
  await resend.emails.send({
    from: "Anshu <onboarding@resend.dev>", 
    to: option.email,
    subject: option.subject,
    html: option.html,
  });
};

module.exports = sendEmail;