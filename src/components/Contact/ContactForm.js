import React, { useEffect, useState } from "react"
import { useFormik } from "formik"
import axios from "axios"

import SubmitButton from "../UI/Button/SubmitButton"

import styles from "./ContactForm.module.scss"

const ContactForm = () => {
  const WEBSITE_URL = "https://admin.crimescenecleanerperth.com.au"
  const FORM_ID = "2124" //Form id that provides Contact Form 7

  const [token, setToken] = useState("") // store token
  const [isSuccessMessage, setIsSuccessMessage] = useState(false) // manage is success message state
  const [messageSent, setMessageSent] = useState(false) // manage sent message state
  const [submitting, setIsSubmitting] = useState(false)

  const submitHandler = () => {
    setIsSubmitting(true)
  }

  // this effect function authenticates our subcriber user to get a token
  useEffect(() => {
    axios({
      method: "post",
      url: `${WEBSITE_URL}/wp-json/jwt-auth/v1/token`,
      data: {
        username: "Subscriber", // provide a user credential with subscriber role, this user does not have any priviledges so exposing this is fine at the moment
        password: "UaqwFL22W#5)uNafDx3#BMPJ",
        // username: process.env.USERNAME,
        // password: process.env.USERPASSWORD,
      },
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(response => {
        setToken(response.data.token)
      })
      .catch(error => console.error("Error", error))
  }, [])

  // use useFormik hook using object destructuring assignment to extract helpful methods
  const { handleChange, isSubmitting, values, handleSubmit } = useFormik({
    initialValues: {
      fullname: "",
      //   service: "",
      email: "",
      message: "",
    },
    onSubmit: async (
      { fullname, email, message },
      { setSubmitting, resetForm }
    ) => {
      setSubmitting(true)
      // here we created a FormData field for each form field
      const bodyFormData = new FormData()
      bodyFormData.set("fullname", fullname)
      //   bodyFormData.set("service", service)
      bodyFormData.set("email", email)
      bodyFormData.set("message", message)

      try {
        const res = await fetch(`https://api.ipify.org?format=json`)
        const resdata = await res.json()
        const geocode = await fetch(
          `https://geo.ipify.org/api/v1?apiKey=at_GMtJycli78jSuYQVMl79fTN6TvPM1&ipAddress=${resdata.ip}`
        )
        const geocoderesdata = await geocode.json()
        if (geocoderesdata.location.country === "IN") {
          setSubmitting(false)
          setMessageSent(true)
          setIsSuccessMessage(false)
          setIsSubmitting(false)
          throw new Error("There was an error")
        }
      } catch (err) {}

      // here we sent
      axios({
        method: "post",
        url: `${WEBSITE_URL}/wp-json/contact-form-7/v1/contact-forms/${FORM_ID}/feedback`,
        data: bodyFormData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
        .then(response => {
          // actions taken when submission goes OK
          resetForm()
          setSubmitting(false)
          setMessageSent(true)
          setIsSuccessMessage(true)
          setIsSubmitting(false)
        })
        .catch(error => {
          // actions taken when submission goes wrong
          setSubmitting(false)
          setMessageSent(true)
          setIsSuccessMessage(false)
          setIsSubmitting(false)
        })
    },
  })

  useEffect(() => {
    // set timeout 3 seconds to remove error/success message.
    setTimeout(() => {
      // this will reset messageSent and isSuccessMessage state
      setMessageSent(false)
      setIsSuccessMessage(false)
    }, 3000)
    // this effect function will be dispatched when isSuccessMessage or messageSent changes its state
  }, [isSuccessMessage, messageSent])

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <div className={styles.formItem}>
            <label htmlFor="fullname">Name*</label>
            <input
              id="fullname"
              name="fullname"
              type="text"
              onChange={handleChange}
              value={values.fullname}
              required
            />
          </div>
          <div className={styles.formItem}>
            <label htmlFor="email">Email*</label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={handleChange}
              value={values.email}
              required
            />
          </div>
          {/* <div>
          <label htmlFor="service">Service Required*</label>
          <select id="service" name="service">
            <option value="crime-scene-cleaning">Crime Scene Cleaning</option>
            <option value="hoarder-cleanup">Hoarder Cleanup</option>
          </select>
        </div> */}
          <div className={styles.formItem}>
            <label htmlFor="message">Additional Info*</label>
            <textarea
              id="message"
              name="message"
              type="text"
              onChange={handleChange}
              value={values.message}
              required
            />
          </div>
        </fieldset>
        <div>
          {/* <button type="submit" value="Send Message" disabled={isSubmitting} /> */}
          <SubmitButton
            onClick={submitHandler}
            type="submit"
            value="Send Message"
            disabled={isSubmitting}
          >
            {!submitting ? "Submit" : "Sending..."}
          </SubmitButton>
        </div>
        {messageSent && isSuccessMessage && (
          <div
            className="container"
            style={{
              padding: "20px",
              marginTop: "20px",
              backgroundColor: "#F6F7C9",
            }}
          >
            <p>Message sent successfully!</p>
          </div>
        )}
        {messageSent && !isSuccessMessage && (
          <div
            className="container"
            style={{
              padding: "20px",
              marginTop: "20px",
              backgroundColor: "#EA8689",
            }}
          >
            <p>something went wrong please try again.</p>
          </div>
        )}
      </form>
    </div>
  )
}

export default ContactForm
