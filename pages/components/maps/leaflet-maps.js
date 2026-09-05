import React from "react";
import dynamic from 'next/dynamic';
import Seo from "@/shared/layout-components/seo/seo";
const LeafletMapsCom = dynamic(()=>import('@/shared/data/map/leaflet-maps-com'), { ssr: false })
const LeafletMaps = () =>{

  return(
  <>
    <Seo title={"Leaflet Maps"}/>

  <LeafletMapsCom/>
  </>
);}

LeafletMaps.propTypes = {};

LeafletMaps.defaultProps = {};

LeafletMaps.layout = "Contentlayout"

export default LeafletMaps;
