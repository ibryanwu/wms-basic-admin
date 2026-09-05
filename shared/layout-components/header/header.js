import React from 'react';
import {
  Navbar,
  Dropdown,
  Button,
  Form,
  Col,
  Row,
  Modal,
} from 'react-bootstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Delete } from '../../redux/actions/action';
import ProductService from '../../services/ProductService';
import { useRouter } from 'next/router';
import { useToken } from '@/lib/hooks/use-token';
import { useAtom } from 'jotai';
import { userInfoAtomS, storeInfoAtomS } from '@/stores/atom';
import Avatar from '@mui/material/Avatar';
export default function Header() {
  const [user] = useAtom(userInfoAtomS);
  const router = useRouter();
  //ATOM ----------------------------------------------------------------
  const [storeInfo] = useAtom(storeInfoAtomS);
  console.log('🚀 ~ Header ~ storeInfo990:', storeInfo);
  const { removeToken } = useToken();
  function signOut() {
    removeToken();
    router.push('/login');
  }
  let { basePath } = useRouter();
  const [Lang, setLang] = React.useState(false);
  function Fullscreen() {
    if (
      (document.fullScreenElement && document.fullScreenElement === null) ||
      (!document.mozFullScreen && !document.webkitIsFullScreen)
    ) {
      if (document.documentElement.requestFullScreen) {
        document.documentElement.requestFullScreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullScreen) {
        document.documentElement.webkitRequestFullScreen(
          Element.ALLOW_KEYBOARD_INPUT,
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  //leftsidemenu
  const openCloseSidebar = () => {
    document.querySelector('body').classList.toggle('sidenav-toggled');
  };
  //rightsidebar
  const Rightsidebar = () => {
    document.querySelector('.sidebar-right').classList.add('sidebar-open');
  };
  const Darkmode = () => {
    document.querySelector('.app').classList.toggle('dark-theme');
    document.querySelector('.app').classList.remove('light-theme');
  };

  // responsivesearch
  const responsivesearch = () => {
    document.querySelector('.navbar-form').classList.toggle('active');
  };
  //swichermainright
  const swichermainright = () => {
    document.querySelector('.demo_changer').classList.toggle('active');
    document.querySelector('.demo_changer').style.right = '0px';
  };
  const [price, setPrice] = React.useState(0);
  // console.log(price);

  let getdata = useSelector((state) => state.cartreducer.carts);

  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // console.log(open)
  };

  const [Data, setData] = React.useState([]);

  // const { id } = useParams();
  const { id } = '';

  const compare = () => {
    let comparedata = getdata.filter((e) => {
      console.log(e, id);
      return e.id === id;
    });
    setData(comparedata);
  };

  React.useEffect(() => {
    compare();
    // eslint-disable-next-line
  }, [id]);
  const ondelete = (id) => {
    dispatch(Delete(id));
  };

  function total() {
    let price = 0;
    getdata.map((ele) => {
      price = ele.price * ele.qnty + price;
      return price;
    });
    setPrice(price);
  }

  React.useEffect(() => {
    total();
  });
  // let navigate = useNavigate();
  let navigate;
  const routeChange = () => {
    let path = `/`;
    navigate(path);
  };
  return (
    <Navbar className="main-header side-header sticky nav nav-item">
      <div className="main-container container-fluid">
        <div className="main-header-left ">
          <div className="responsive-logo">
            <Link href={`/dashboard`} className="header-logo">
              <img
                src={storeInfo.logo_url}
                className="mobile-logo wd-50"
                alt={storeInfo.name}
              />
            </Link>
          </div>
          <div
            className="app-sidebar__toggle"
            data-bs-toggle="sidebar"
            onClick={() => openCloseSidebar()}
          >
            <Link className="open-toggle" href="#!">
              <i className="header-icon fe fe-align-left"></i>
            </Link>
            <Link className="close-toggle" href="#!">
              <i className="header-icon fe fe-x"></i>
            </Link>
          </div>
          <div className="logo-horizontal">
            <Link href={`/dashboard`} className="header-logo">
              {storeInfo && (
                <img
                  src={storeInfo.logo_url}
                  className="main-logo  desktop-logo"
                  alt={storeInfo.name}
                />
              )}
            </Link>
          </div>
          {/* <div className="main-header-center ms-4 d-sm-none d-md-none d-lg-block form-group">
            <input
              className="form-control"
              placeholder="Search..."
              type="search"
            />
            <Button variant="" className="btn">
              <i className="fas fa-search"></i>
            </Button>
          </div> */}
        </div>
        <div className="main-header-right">
          <Navbar.Toggle
            className="navresponsive-toggler d-lg-none ms-auto"
            type="button"
          >
            <span className="navbar-toggler-icon fe fe-more-vertical"></span>
          </Navbar.Toggle>
          <div className="mb-0 navbar navbar-expand-lg   navbar-nav-right responsive-navbar navbar-dark p-0">
            <Navbar.Collapse className="collapse" id="navbarSupportedContent-4">
              <ul className="nav nav-item header-icons navbar-nav-right ">
                {/* <li className="dropdown nav-item">
                  <>
                    <Link
                      className="new nav-link"
                      data-bs-target="#country-selector"
                      data-bs-toggle="modal"
                      href="#!"
                      onClick={() => setLang(true)}
                    >
                      <svg
                        className="header-icon-svgs"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.931 9h-2.764a14.67 14.67 0 0 0-1.792-6.243A8.013 8.013 0 0 1 19.931 11zM12.53 4.027c1.035 1.364 2.427 3.78 2.627 6.973H9.03c.139-2.596.994-5.028 2.451-6.974.172-.01.344-.026.519-.026.179 0 .354.016.53.027zm-3.842.7C7.704 6.618 7.136 8.762 7.03 11H4.069a8.013 8.013 0 0 1 4.619-6.273zM4.069 13h2.974c.136 2.379.665 4.478 1.556 6.23A8.01 8.01 0 0 1 4.069 13zm7.381 6.973C10.049 18.275 9.222 15.896 9.041 13h6.113c-.208 2.773-1.117 5.196-2.603 6.972-.182.012-.364.028-.551.028-.186 0-.367-.016-.55-.027zm4.011-.772c.955-1.794 1.538-3.901 1.691-6.201h2.778a8.005 8.005 0 0 1-4.469 6.201z" />
                      </svg>
                    </Link>
                    <Modal
                      show={Lang}
                      onHide={() => setLang(false)}
                      centered="true"
                      id="country-selector"
                    >
                      <Modal.Header>
                        <h6 className="modal-title">Choose Country</h6>
                        <Button
                          variant=""
                          type="button"
                          onClick={() => setLang(false)}
                        >
                          <span aria-hidden="true" className="text-dark">
                            X
                          </span>
                        </Button>
                      </Modal.Header>
                      <Modal.Body>
                        <Row as="ul" className=" p-3">
                          <Col lg={6} as="li" className="mb-2">
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block active"
                            >
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/us_flag.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Usa{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2 mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/italy_flag.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Italy{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/spain_flag.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Spain{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/india_flag.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              India{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/french_flag.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              France{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/mexico.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Mexico{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/singapore.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Singapore{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/poland.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Poland{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/austria.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Austria{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/russia_flag.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Russia{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/germany_flag.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Germany{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/argentina.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Argentina{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/brazil.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Brazil{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/uae.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              U.A.E{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/china.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              China{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/uk.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              U.K{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/malaysia.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Malaysia{' '}
                            </Link>{' '}
                          </Col>{' '}
                          <Col lg={6} as="li" className="mb-2">
                            {' '}
                            <Link
                              href="#!"
                              className="btn btn-country btn-lg btn-block"
                            >
                              {' '}
                              <span className="country-selector">
                                <img
                                  alt=""
                                  src={`${
                                    process.env.NODE_ENV === 'production'
                                      ? basePath
                                      : ''
                                  }/assets/img/flags/canada.jpg`}
                                  className="me-3 language"
                                />
                              </span>
                              Canada{' '}
                            </Link>{' '}
                          </Col>{' '}
                        </Row>
                      </Modal.Body>
                    </Modal>
                  </>
                </li> */}
                <li className="dropdown nav-item">
                  <a
                    className="new nav-link theme-layout nav-link-bg layout-setting "
                    onClick={() => {
                      Darkmode();
                    }}
                  >
                    <span className="dark-layout">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="header-icon-svgs"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93 9.93 9.93 0 0 0 7.07-2.929 10.007 10.007 0 0 0 2.583-4.491 1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343 7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483 10.027 10.027 0 0 0 2.89 7.848 9.972 9.972 0 0 0 7.848 2.891 8.036 8.036 0 0 1-1.484 2.059z" />
                      </svg>
                    </span>
                    <span className="light-layout">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="header-icon-svgs"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6.993 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007S14.761 6.993 12 6.993 6.993 9.239 6.993 12zM12 8.993c1.658 0 3.007 1.349 3.007 3.007S13.658 15.007 12 15.007 8.993 13.658 8.993 12 10.342 8.993 12 8.993zM10.998 19h2v3h-2zm0-17h2v3h-2zm-9 9h3v2h-3zm17 0h3v2h-3zM4.219 18.363l2.12-2.122 1.415 1.414-2.12 2.122zM16.24 6.344l2.122-2.122 1.414 1.414-2.122 2.122zM6.342 7.759 4.22 5.637l1.415-1.414 2.12 2.122zm13.434 10.605-1.414 1.414-2.122-2.122 1.414-1.414z" />
                      </svg>
                    </span>
                  </a>
                </li>

                {/* <Dropdown className=" nav-item main-header-notification d-flex">
                  <Dropdown.Toggle
                    className="new nav-link"
                    href="#!"
                    variant=""
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="header-icon-svgs"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 13.586V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258C7.185 4.074 5 6.783 5 10v3.586l-1.707 1.707A.996.996 0 0 0 3 16v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a.996.996 0 0 0-.293-.707L19 13.586zM19 17H5v-.586l1.707-1.707A.996.996 0 0 0 7 14v-4c0-2.757 2.243-5 5-5s5 2.243 5 5v4c0 .266.105.52.293.707L19 16.414V17zm-7 5a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22z" />
                    </svg>
                    <span className=" pulse"></span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="slid1">
                    <div className="menu-header-content text-start border-bottom">
                      <div className="d-flex">
                        <h6 className="dropdown-title mb-1 tx-15 font-weight-semibold">
                          Notifications
                        </h6>
                        <span className="badge badge-pill badge-warning ms-auto my-auto float-end">
                          Mark All Read
                        </span>
                      </div>
                      <p className="dropdown-title-text subtext mb-0 op-6 pb-0 tx-12 ">
                        You have 4 unread Notifications
                      </p>
                    </div>
                    <PerfectScrollbar style={{ height: 280 }}>
                      <div className="main-notification-list Notification-scroll">
                        <Link
                          className="d-flex p-3 border-bottom"
                          href={`/components/pages/mail/mail/`}
                        >
                          <div className="notifyimg bg-pink">
                            <i className="far fa-folder-open text-white"></i>
                          </div>
                          <div className="ms-3">
                            <h5 className="notification-label mb-1">
                              New files available
                            </h5>
                            <div className="notification-subtext">
                              10 hour ago
                            </div>
                          </div>
                          <div className="ms-auto">
                            <i className="las la-angle-right text-end text-muted"></i>
                          </div>
                        </Link>
                        <Link
                          className="d-flex p-3  border-bottom"
                          href={`/components/pages/mail/mail/`}
                        >
                          <div className="notifyimg bg-purple">
                            <i className="fab fa-delicious text-white"></i>
                          </div>
                          <div className="ms-3">
                            <h5 className="notification-label mb-1">
                              Updates Available
                            </h5>
                            <div className="notification-subtext">
                              2 days ago
                            </div>
                          </div>
                          <div className="ms-auto">
                            <i className="las la-angle-right text-end text-muted"></i>
                          </div>
                        </Link>
                        <Link
                          className="d-flex p-3 border-bottom"
                          href={`/components/pages/mail/mail/`}
                        >
                          <div className="notifyimg bg-success">
                            <i className="fa fa-cart-plus text-white"></i>
                          </div>
                          <div className="ms-3">
                            <h5 className="notification-label mb-1">
                              New Order Received
                            </h5>
                            <div className="notification-subtext">
                              1 hour ago
                            </div>
                          </div>
                          <div className="ms-auto">
                            <i className="las la-angle-right text-end text-muted"></i>
                          </div>
                        </Link>
                        <Link
                          className="d-flex p-3 border-bottom"
                          href={`/components/pages/mail/mail/`}
                        >
                          <div className="notifyimg bg-warning">
                            <i className="far fa-envelope-open text-white"></i>
                          </div>
                          <div className="ms-3">
                            <h5 className="notification-label mb-1">
                              New review received
                            </h5>
                            <div className="notification-subtext">
                              1 day ago
                            </div>
                          </div>
                          <div className="ms-auto">
                            <i className="las la-angle-right text-end text-muted"></i>
                          </div>
                        </Link>
                        <Link
                          className="d-flex p-3 border-bottom"
                          href={`/components/pages/mail/mail/`}
                        >
                          <div className="notifyimg bg-danger">
                            <i className="fab fa-wpforms text-white"></i>
                          </div>
                          <div className="ms-3">
                            <h5 className="notification-label mb-1">
                              22 verified registrations
                            </h5>
                            <div className="notification-subtext">
                              2 hour ago
                            </div>
                          </div>
                          <div className="ms-auto">
                            <i className="las la-angle-right text-end text-muted"></i>
                          </div>
                        </Link>
                        <Link
                          className="d-flex p-3 border-bottom"
                          href={`/components/pages/mail/mail/`}
                        >
                          <div className="">
                            <i className="far fa-check-square text-white notifyimg bg-success"></i>
                          </div>
                          <div className="ms-3">
                            <h5 className="notification-label mb-1">
                              Project has been approved
                            </h5>
                            <span className="notification-subtext">
                              4 hour ago
                            </span>
                          </div>
                          <div className="ms-auto">
                            <i className="las la-angle-right text-end text-muted"></i>
                          </div>
                        </Link>
                      </div>
                    </PerfectScrollbar>
                    <div className="dropdown-footer">
                      <Link
                        className="btn btn-primary btn-sm btn-block"
                        href={`/components/pages/mail/mail/`}
                      >
                        VIEW ALL
                      </Link>
                    </div>
                  </Dropdown.Menu>
                </Dropdown> */}
                <li
                  className="nav-item full-screen fullscreen-button"
                  onClick={Fullscreen}
                >
                  <Link className="new nav-link full-screen-link" href="#!">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="header-icon-svgs"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 5h5V3H3v7h2zm5 14H5v-5H3v7h7zm11-5h-2v5h-5v2h7zm-2-4h2V3h-7v2h5z" />
                    </svg>
                  </Link>
                </li>

                <li className="nav-link search-icon d-lg-none d-block">
                  <Form
                    className="navbar-form"
                    role="search"
                    onClick={() => responsivesearch()}
                  >
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search"
                      />
                      <span className="input-group-btn">
                        <Button
                          variant=""
                          type="reset"
                          className="btn btn-default"
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                        <Button
                          variant=""
                          className="btn btn-default nav-link resp-btn"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            className="header-icon-svgs"
                            viewBox="0 0 24 24"
                            width="24px"
                            fill="#000000"
                          >
                            <path d="M0 0h24v24H0V0z" fill="none" />
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                          </svg>
                        </Button>
                      </span>
                    </div>
                  </Form>
                </li>
                <Dropdown className=" main-profile-menu nav nav-item nav-link ps-lg-2">
                  <Dropdown.Toggle
                    className="new nav-link profile-user d-flex"
                    variant=""
                  >
                    {/* <img
                      alt=""
                      src={`${
                        process.env.NODE_ENV === 'production' ? basePath : ''
                      }/assets/img/faces/2.jpg`}
                      className=""
                    /> */}
                    {user.firstName && <Avatar>{user.firstName[0]}</Avatar>}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <div className="menu-header-content p-3 border-bottom">
                      <div className="d-flex wd-100p">
                        {/* <div className="main-img-user">
                          <img
                            alt=""
                            src={`${
                              process.env.NODE_ENV === 'production'
                                ? basePath
                                : ''
                            }/assets/img/faces/2.jpg`}
                            className=""
                          />
                        </div> */}
                        <div className="ms-3 my-auto">
                          <h6 className="tx-15 font-weight-semibold mb-0">
                            {user.firstName}
                          </h6>
                          <span className="dropdown-title-text subtext op-6  tx-12">
                            {storeInfo?.version}
                          </span>
                          <p className="dropdown-title-text subtext op-6  tx-12">
                            {storeInfo?.db}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* <Link
                      className="dropdown-item"
                      href={`/components/pages/profile/`}
                    >
                      <i className="far fa-user-circle"></i>Profile
                    </Link>
                    <Link
                      className="dropdown-item"
                      href={`/components/pages/mail/chat/`}
                    >
                      <i className="far fa-smile"></i> chat
                    </Link>
                    <Link
                      className="dropdown-item"
                      href={`/components/pages/mail/read-mail/`}
                    >
                      <i className="far fa-envelope "></i>Inbox
                    </Link>
                    <Link
                      className="dropdown-item"
                      href={`/components/pages/mail/mail/`}
                    >
                      <i className="far fa-comment-dots"></i>Messages
                    </Link>
                    <Link
                      className="dropdown-item"
                      href={`/components/pages/settings/`}
                    >
                      <i className="far fa-sun"></i> Settings
                    </Link> */}
                    <Link
                      className="dropdown-item"
                      href=""
                      onClick={() => {
                        signOut();
                      }}
                    >
                      <i className="far fa-arrow-alt-circle-left"></i> Sign Out
                    </Link>
                  </Dropdown.Menu>
                </Dropdown>
              </ul>
            </Navbar.Collapse>
          </div>
          {/* 设置按钮 */}
          {/* <div className="d-flex">
            <Link
              className="demo-icon new nav-link"
              href="#!"
              onClick={() => swichermainright()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="header-icon-svgs fa-spin"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M12 16c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.084 0 2 .916 2 2s-.916 2-2 2-2-.916-2-2 .916-2 2-2z" />
                <path d="m2.845 16.136 1 1.73c.531.917 1.809 1.261 2.73.73l.529-.306A8.1 8.1 0 0 0 9 19.402V20c0 1.103.897 2 2 2h2c1.103 0 2-.897 2-2v-.598a8.132 8.132 0 0 0 1.896-1.111l.529.306c.923.53 2.198.188 2.731-.731l.999-1.729a2.001 2.001 0 0 0-.731-2.732l-.505-.292a7.718 7.718 0 0 0 0-2.224l.505-.292a2.002 2.002 0 0 0 .731-2.732l-.999-1.729c-.531-.92-1.808-1.265-2.731-.732l-.529.306A8.1 8.1 0 0 0 15 4.598V4c0-1.103-.897-2-2-2h-2c-1.103 0-2 .897-2 2v.598a8.132 8.132 0 0 0-1.896 1.111l-.529-.306c-.924-.531-2.2-.187-2.731.732l-.999 1.729a2.001 2.001 0 0 0 .731 2.732l.505.292a7.683 7.683 0 0 0 0 2.223l-.505.292a2.003 2.003 0 0 0-.731 2.733zm3.326-2.758A5.703 5.703 0 0 1 6 12c0-.462.058-.926.17-1.378a.999.999 0 0 0-.47-1.108l-1.123-.65.998-1.729 1.145.662a.997.997 0 0 0 1.188-.142 6.071 6.071 0 0 1 2.384-1.399A1 1 0 0 0 11 5.3V4h2v1.3a1 1 0 0 0 .708.956 6.083 6.083 0 0 1 2.384 1.399.999.999 0 0 0 1.188.142l1.144-.661 1 1.729-1.124.649a1 1 0 0 0-.47 1.108c.112.452.17.916.17 1.378 0 .461-.058.925-.171 1.378a1 1 0 0 0 .471 1.108l1.123.649-.998 1.729-1.145-.661a.996.996 0 0 0-1.188.142 6.071 6.071 0 0 1-2.384 1.399A1 1 0 0 0 13 18.7l.002 1.3H11v-1.3a1 1 0 0 0-.708-.956 6.083 6.083 0 0 1-2.384-1.399.992.992 0 0 0-1.188-.141l-1.144.662-1-1.729 1.124-.651a1 1 0 0 0 .471-1.108z" />
              </svg>
            </Link>
          </div> */}
        </div>
      </div>
    </Navbar>
  );
}

Header.propTypes = {};

Header.defaultProps = {};
