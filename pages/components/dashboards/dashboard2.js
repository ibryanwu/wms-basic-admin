import React from 'react'
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
const Dashboard2com = dynamic(()=>import('@/shared/data/dashboards/dashboard2com'), { ssr: false })

const Dashboard2 = () => {
  return (<>
    <Seo title={"Dashboard2"}/>
    <div><Dashboard2com/></div>
  </>
  )
}

Dashboard2.layout = "Contentlayout"

export default Dashboard2