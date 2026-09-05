import React, { useState } from "react";
import { Breadcrumb, Button, Card, Col, Row, Form, Image } from 'react-bootstrap';
import { MultipleSelect, Multipledisable, Multiple, Searchableselect, Selectdis, Singleselect, options, Prefilledinputs, AnimatedMulti } from '../../../shared/data/form/advanced-forms';
// import IntlTelInput from "react-intl-tel-input";
import Select from "react-select";
import MultiSelect from "react-multiple-select-dropdown-lite";
import Creatable from "react-select/creatable";
import Link from "next/link";
import { UploadButton } from "react-uploader";
import { Uploader } from "uploader";
import { groupedOptions } from '../../../shared/data/form/advanced-forms'
import Seo from "@/shared/layout-components/seo/seo";
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css'
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const AdvancedForms = () => {
  const [selected1, setSelected1] = useState([]);
  const [selected2, setSelected2] = useState([]);
  const [selectedFiles, setselectedFiles] = useState([]);
  const [multiple, setmultiple] = useState("");
  const [disable, setdisable] = useState("");
  const [Multiplevalue, setMultiplevalue] = useState("");
  const [Singleselect, setSingleselect] = useState();
  const [Selectdis, setSelectdis] = useState(null);
  const [Search, setSearch] = useState(null);

  //Fileuploader2
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  function handleAcceptedFiles(files) {
    files.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
      })
    );
    setselectedFiles(files);
  }

  //Fileuploader
  const [Fileuploader, setFileuploader] = useState([]);
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  //Fileuploader2
  const [files, setFiles] = useState([]);
  const uploader = Uploader({
    // Get production API keys from Upload.io
    apiKey: "free"
  });
  const [filesimade, setFilesimage] = useState([]);
  const [filespond, setfilespond] = useState([]);
  return (
    <div>
      <Seo title={"Advanced Forms"}/>

      {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            ADVANCED FORMS
          </span>
        </div>
        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
              Forms
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              Advanced Forms
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      {/* <!-- /breadcrumb --> */}

      {/* <!-- row --> */}
      <Row>
        <Col lg={6} md={12}>
          <Card>
            <Card.Body>
              <div>
                <h6 className="card-title mb-1">Single Select Style</h6>
              </div>
              <div className="mb-4">
                <p className="mg-b-10">Single Select</p>
                <div className=" SlectBox">
                  <Select
                    classNamePrefix="selectform"
                    defaultValue={Singleselect}
                    onChange={(e) => console.log(e.value)}
                    options={options}
                    placeholder="eg1"
                  />
                </div>
              </div>
              <div className="mb-4">
                <p className="mg-b-10">Disabled Select</p>
                <div className="SlectBox">
                  <Select
                    classNamePrefix="selectform"
                    defaultValue={Selectdis}
                    onChange={(e) => console.log(e.value)}
                    options={options}
                    placeholder="eg1"
                    isDisabled="disable"
                  />
                </div>
              </div>
              <div>
                <p className="mg-b-10">Inline Search Select</p>
                <div className=" SlectBox">
                  <Select
                  classNamePrefix="selectform"
                    defaultValue={Search}
                    onChange={(e) => console.log(e.value)}
                    options={options}
                    placeholder="eg1"
                    isSearchable="true"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} md={12}>
          <Card>
            <Card.Body>
              <div>
                <h6 className="card-title mb-1">Multiple Select Styles</h6>
              </div>
              <div className="mb-3">
                <p className="mg-b-9">Multiple Select</p>
                <MultiSelect
                  id="select-beasts"
                  name="beast"
                  onChange={(e) => console.log(e.value)}
                  placeholder="eg1"
                  options={options}
                  singleSelect="true"
                  
                />
              </div>
              <div className="mb-3">
                <p className="mg-b-9">Disabled Select</p>
                <MultiSelect
                  id="select-beasts"
                  name="beast"
                  onChange={(e) => console.log(e.value)}
                  placeholder="eg1"
                  options={options}
                  disabled="true"
                />
              </div>
              <div>
                <p className="mg-b-9">Optgroup Support</p>
                <MultiSelect
                  id="select-beasts"
                  name="beast"
                  onChange={(e) => console.log(e.value)}
                  placeholder="eg1"
                  options={options}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={12} md={12}>
          <Card>
            <Card.Body>
              <div>
                <h6 className="card-title mb-1">Multiple Select Styles</h6>
              </div>
              <div className="mb-4">
                <p className="mg-b-10">Multiple Select-1</p>
                <Prefilledinputs/>
              </div>
              <div>
                <p className="mg-b-10">Multiple Select-2</p>
                <div>
                  <AnimatedMulti/>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* <!-- /row --> */}

      {/* <!-- row --> */}
      {/* <Row>
        <Col lg={12} md={12}>
          <Card>
            <Card.Body>
              <div>
                <h6 className="card-title mb-1">Telephone Input</h6>
                <p className="text-muted card-sub-title">
                  A JavaScript plugin for entering and validating international
                  telephone numbers. It adds a flag dropdown to any input, detects
                  the {`user's`} country, displays a relevant placeholder and provides
                  formatting/validation methods.
                </p>
              </div>
              <div >
              <PhoneInput
                country={"us"}
                value="1425652"
                onChange={phone => console.log({ phone })}
              />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row> */}
      {/* <!-- /row --> */}

      {/* <!-- row --> */}
      <Row>
        <Col lg={12} md={12}>
          <Card>
            <Card.Body>
              <div>
                <h6 className="card-title mb-1">File Upload</h6>

              </div>
              <Row className="mb-4">
                <Col sm={12} md={4}>
                <UploadButton uploader={uploader}
                    options={{ multi: true }}
                    onComplete={files => console.log(files)}>
                    {({ onClick }) =>
                      <Form.Control className='file_input text-center' onClick={onClick} placeholder='click here and upload attachment' />
                    }
                  </UploadButton>
                  <div className="list-unstyled mb-0" id="file-previews">
                    {Fileuploader.map((f, i) => {
                      return (
                        <Card
                          className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete"
                          key={i + "-file"}
                        >
                          <div className="p-2">
                            <Row className="align-items-center">
                              <Col className="col-auto">
                                <Image
                                  data-dz-thumbnail=""
                                  height="80"
                                  className="avatar-sm rounded bg-light"
                                  alt={f.name}
                                  src={f.preview}
                                />
                              </Col>
                              <Col>
                                <Link href="#!" className="text-muted font-weight-bold">
                                  {f.name}
                                </Link>
                                <p className="mb-0">
                                  <strong>{f.formattedSize}</strong>
                                </p>
                              </Col>
                            </Row>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </Col>
                <Col sm={12} md={4} className="mg-t-10 mg-md-t-0">
                <FilePond className='mt-3 mb-5 mt-lg-0'
                  files={filesimade}
                  allowReorder={true}
                  allowMultiple={false}
                  onupdatefiles={setFilesimage}
                  labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                />
                </Col>
                <Col sm={12} md={4} className="mg-t-10 mg-md-t-0">
                <FilePond className='mt-3 mb-5 m-lg-0'
                  allowMultiple={true}
                  maxFiles={10}
                  server="https://dummyjson.com/products/add"
                  files={filespond}
                  onupdatefiles={setfilespond}
                  allowReorder={true}
                  labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                />
                  <div className="list-unstyled mb-0" id="file-previews">
                    {selectedFiles.map((f, i) => {
                      return (
                        <Card
                          className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete"
                          key={i + "-file"}
                        >
                          <div className="p-2">
                            <Row className="align-items-center">
                              <Col className="col-auto">
                                <Image
                                  data-dz-thumbnail=""
                                  height="80"
                                  className="avatar-sm rounded bg-light"
                                  alt={f.name}
                                  src={f.preview}
                                />
                              </Col>
                              <Col>
                                <Link href="#!" className="text-muted font-weight-bold">
                                  {f.name}
                                </Link>
                                <p className="mb-0">
                                  <strong>{f.formattedSize}</strong>
                                </p>
                              </Col>
                            </Row>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </Col>
              </Row>
              <div className='textnone'>
                <div>
                  {/* <DropzoneArea
                    showPreviews={true}
                    showPreviewsInDropzone={false}
                    useChipsForPreview
                    previewGridProps={{ container: { spacing: 1, direction: "row" } }}
                    // previewChipProps={{ classes: { root: classes.previewChip } }}
                    previewText="Selected files"
                  /> */}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* <!-- row closed --> */}
    </div>
  );
}

AdvancedForms.propTypes = {};

AdvancedForms.defaultProps = {};

AdvancedForms.layout = "Contentlayout"

export default AdvancedForms;
