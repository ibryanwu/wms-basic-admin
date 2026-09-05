import React from "react";
import dynamic from 'next/dynamic';
import Seo from "@/shared/layout-components/seo/seo";
const Gallerycom = dynamic(()=>import('@/shared/data/pages/gallerycom'), { ssr: false })

const Gallery = () => {
  return (
    <div>
      <Seo title={"Gallery"}/>

      <Gallerycom/>
    </div>
  );
}

Gallery.propTypes = {};

Gallery.defaultProps = {};

Gallery.layout = "Contentlayout"

export default Gallery;
