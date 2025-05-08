//Contact Verification
const contactInput = document.getElementById("contact");
const contactError = document.getElementById("contact-error");
let timeout = null;

//Email Validation
const emailInput = document.getElementById("email");
const emailError = document.getElementById("email-error");
let emailTimeout = null; // Use separate timeout for email

// Contact number validation
contactInput.addEventListener("input", () => {
  const number = contactInput.value;

  const ContactapiKey = '154e58ca43404d0e87d6d933a810dc33';
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (number.length < 10) {
      contactError.textContent = "Please enter a contact number with country code first.";
      contactError.style.color = "red";
      return;
    }

    fetch(`https://phonevalidation.abstractapi.com/v1/?api_key=${ContactapiKey}&phone=${number}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          contactError.textContent = "✔ Valid number";
          contactError.style.color = "green";
        } else {
          contactError.textContent = "✘ Unknown number";
          contactError.style.color = "red";
        }
      })
      .catch(() => {
        contactError.textContent = "Error checking number.";
        contactError.style.color = "red";
      });
  }, 600);
});

// Email Validation
emailInput.addEventListener("input", () => {
  const email = emailInput.value.trim();
  const EmailapiKey = 'fa739066d36f49298a6911fedf27e33b';

  clearTimeout(emailTimeout);
  emailTimeout = setTimeout(() => {
    // Check for obviously invalid format first (basic)
    if (!email || !email.includes("@") || !email.includes(".")) {
      emailError.textContent = "Please enter a valid email format.";
      emailError.style.color = "red";
      return;
    }

    // Optional: skip API if email is clearly fake
    if (email.endsWith("@example.com")) {
      emailError.textContent = "Unknown Email";
      emailError.style.color = "red";
      return;
    }

    // Now check using API
    fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${EmailapiKey}&email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.deliverability === "DELIVERABLE" || data.is_valid_format?.value === true) {
          emailError.textContent = "✔ Valid email";
          emailError.style.color = "green";
        } else {
          emailError.textContent = "✘ Invalid email";
          emailError.style.color = "red";
        }
      })
      .catch(() => {
        emailError.textContent = "Error checking the email.";
        emailError.style.color = "red";
      });
  }, 600);
});

//Sending Message

(function() {
  emailjs.init("fNNL1mAZBb9IYnLZr"); // Replace with your EmailJS user ID
})();

// Form submission event
document.getElementById("contact-form").addEventListener("submit", function(event) {
  event.preventDefault();  // Prevent the default form submission

  // Now sending the form directly using `this` (the form element)
  emailjs.sendForm("service_1s2t698", "template_z2x5t2s", this)
    .then(function(response) {
      console.log("SUCCESS!", response);
      alert("Message sent successfully!");
    }, function(error) {
      console.error("FAILED...", error);
      alert("Failed to send message: " + error.text);
    });
});