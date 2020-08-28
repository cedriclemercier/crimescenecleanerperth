import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import InfoBanner from "../components/Banners/infoBanner"

export const query = graphql`
  query($slug: String!) {
    wpPost(slug: { eq: $slug }) {
      title
      slug
      content
    }
  }
`

const Blog = props => {
  let pageContent = (
    <section>
      <div
        className="container"
        dangerouslySetInnerHTML={{ __html: props.data.wpPost.content }}
      ></div>
    </section>
  )

  return (
    <Layout>
      <SEO title={props.data.wpPost.title} />
      <InfoBanner>
        <div className="container">
          <p>24/7 BIOREMEDIATION SERVICE | CALL 1300 246 429</p>
        </div>
      </InfoBanner>
      {pageContent}
    </Layout>
  )
}

export default Blog