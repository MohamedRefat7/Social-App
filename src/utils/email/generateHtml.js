export function template(code, name, subject) {
  return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
                  color: #333;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              .header {
                  background-color: #4CAF50;
                  color: white;
                  text-align: center;
                  padding: 20px;
              }
              .content {
                  padding: 20px;
                  text-align: center;
              }
              .footer {
                  background-color: #f4f4f4;
                  text-align: center;
                  padding: 10px;
                  font-size: 14px;
                  color: #888;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Social Media Application</h1>
              </div>
              <div class="content">
                  <h2>Hello ${name},</h2>
                  <h2>${subject}</h2>
                  <p>Your OTP is: <strong>${code}</strong></p>
                  <p>Please use this OTP to verify your email.</p>
              </div>
              <div class="footer">
                  <p>If you did not request this, please ignore this email.</p>
              </div>
          </div>
      </body>
      </html>`;
}
