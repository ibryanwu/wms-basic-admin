import React from 'react';
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
const FormEditorCom = dynamic(()=>import('@/shared/data/form/formeditorcom'), { ssr: false })

const FormEditor = () => (
  <>
  <Seo title={"Forms Editor"}/>
  <FormEditorCom/>
  </>
);

FormEditor.propTypes = {};

FormEditor.defaultProps = {};

FormEditor.layout = "Contentlayout"

export default FormEditor;
