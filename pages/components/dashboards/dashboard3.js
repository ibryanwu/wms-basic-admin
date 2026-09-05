import React from 'react'
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
const Dashboard3com = dynamic(()=>import('@/shared/data/dashboards/dashboard3com'), { ssr: false })


const dashboard3 = () => {
  return (
    <div>
      <Seo title={"Dashboard3"}/>
      <Dashboard3com/>
    </div>
  )
}

dashboard3.layout = "Contentlayout"

export default dashboard3