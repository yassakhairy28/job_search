export const templateOTP = (otp, userName, subject, msg) => {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f3f2ef;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #0073b1;
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
    }
    .email-body {
      padding: 20px;
      color: #333333;
      line-height: 1.6;
    }
    .email-body h2 {
      color: #0073b1;
    }
    .otp-code {
      display: inline-block;
      background-color: #0073b1;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .email-footer {
      text-align: center;
      padding: 15px;
      background-color: #f3f2ef;
      font-size: 14px;
      color: #777777;
    }
    .email-footer a {
      color: #0073b1;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h4>${subject}</h4>
    </div>
    <div class="email-body">
      <h2>Hello, ${userName}</h2>
      <p>${msg}</p>
      <div class="otp-code">${otp}</div>
      <p>If you didn’t request this, please ignore this email.</p>
      <p>Best regards,<br>Job Search Application</p>
    </div>
    <div class="email-footer">
      <p>&copy; 2025 Social Media App. All rights reserved.</p>
      <p><a href="mailto:yassa7000@gmail.com">Contact Support</a> | <a href="#">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;
};
