// src/pages/HomePage.jsx
import HeroSection from '../components/home/HeroSection'
import ExperienceSplit from '../components/home/ExperienceSplit'
import BrandStoryTeaser from '../components/home/BrandStoryTeaser'
// import FeaturedCategories from '../components/home/FeaturedCategories'
import FeaturedCollection from '../components/home/FeaturedCollection'
import SpecialOffersBanner from '../components/home/SpecialOffersBanner'

function HomePage() {
  return (
    <>
      <HeroSection />
      {/* <FeaturedCategories /> */}
      <SpecialOffersBanner />
      <ExperienceSplit />
      <FeaturedCollection />
      <BrandStoryTeaser />
    </>
  )
}

export default HomePage