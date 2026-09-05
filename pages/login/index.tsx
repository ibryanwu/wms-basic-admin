'use client';
import React from 'react';
import Head from 'next/head';
import favicon from '../../public/assets/img/brand/favicon.png';
import {
  Alert,
  Button,
  Col,
  Form,
  Image,
  Row,
  Tab,
  Tabs,
} from 'react-bootstrap';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Seo from '@/shared/layout-components/seo/seo';
import { useLogin } from '@/rest/users';
import { useForm } from 'react-hook-form';
import { Flip, toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { getStaticTranslations } from '@/lib/i18n';

export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common']);
}

export default function Login() {
  // 获取默认语言
  const { t } = useTranslation('common'); // 加载 common.json 文件

  //=====================
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    //defaultValues: { email: 'ibryan@gmail.com', password: '123456' },
  });

  useEffect(() => {
    //清理缓存和token

    if (document.body) {
      document
        ?.querySelector('body')
        ?.classList.add('ltr', 'error-page1', 'bg-primary');
    }

    return () => {
      document.body.classList.remove('ltr', 'error-page1', 'bg-primary');
    };
  }, []);

  const { mutate: loginMutate, isLoading, error } = useLogin();

  async function onSubmit(data: { email: any; password: any; storeId: any }) {
    loginMutate(data);
  }

  useEffect(() => {
    if (error)
      if (error.message?.length > 0) {
        loginFailed(error?.message as string);
      }
  }, [error]);

  const loginFailed = (errorMsg: string) =>
    toast.error(<p className="text-white tx-16 mb-0 ">{errorMsg}</p>, {
      position: toast.POSITION.TOP_RIGHT,
      hideProgressBar: false,
      transition: Flip,
      theme: 'colored',
    });
  return (
    <>
      <Head>
        <title>WMS</title>
        <meta name="description" content="Spruha" />
        <link rel="icon" href={favicon.src} />
        {/* <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap" rel="stylesheet"></link> */}
      </Head>
      <Seo title={'Login'} />
      <ToastContainer />
      <div className="page">
        <div className="page-single">
          <div className="container">
            <Row>
              <Col
                xl={5}
                lg={6}
                md={8}
                sm={8}
                xs={10}
                className="card-sigin-main mx-auto my-auto py-4 justify-content-center"
              >
                <div className="card-sigin">
                  {/* <!-- Demo content--> */}
                  <div className="main-card-signin d-md-flex">
                    <div className="wd-100p">
                      <div className="d-flex justify-content-center  ">
                        <span className="tx-30"> WMS Login</span>
                      </div>
                      <div className="">
                        <div className="main-signup-header">
                          <div className="panel panel-primary">
                            <div className="tab-menu-heading mb-2 border-bottom-0">
                              <div className="tabs-menu1">
                                <Form
                                  onSubmit={handleSubmit((data) => {
                                    onSubmit({
                                      email: data.email,
                                      password: data.password,
                                      storeId: process.env.NEXT_PUBLIC_STORE_ID,
                                    });
                                  })}
                                >
                                  <Form.Group className="form-group">
                                    <Form.Label>Email</Form.Label>{' '}
                                    <Form.Control
                                      {...register('email', {
                                        required: 'Please enter a valid email',
                                        validate: (value): any => {
                                          var pPattern =
                                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                                          if (!pPattern.test(value)) {
                                            return 'Requires a verified email address!';
                                          }
                                        },
                                      })}
                                      className="form-control"
                                      placeholder="Enter your email"
                                      type="email"
                                      //name="email"
                                    />
                                    {errors.email && (
                                      <Form.Text className="text-danger">
                                        {errors.email.message as string}
                                      </Form.Text>
                                    )}
                                  </Form.Group>
                                  <Form.Group className="form-group">
                                    <Form.Label>Password</Form.Label>{' '}
                                    <Form.Control
                                      {...register('password', {
                                        required: 'Please enter your password',
                                      })}
                                      className="form-control"
                                      placeholder="Enter your password"
                                      type="password"
                                    />{' '}
                                    {errors.password && (
                                      <Form.Text className="text-danger">
                                        {errors.password.message as string}
                                      </Form.Text>
                                    )}
                                  </Form.Group>
                                  <Button
                                    type="submit"
                                    //onClick={ReactLogin}
                                    variant=""
                                    className="btn btn-primary btn-block"
                                  >
                                    {t('btn_login')}
                                  </Button>
                                </Form>
                              </div>
                            </div>

                            <div className="panel-body tabs-menu-body border-0 p-3">
                              <div className="tab-content"></div>
                            </div>
                          </div>

                          {/* <div className="main-signin-footer text-center mt-3">
                            <p>
                              <Link href="" className="mb-3">
                                Forgot password?
                              </Link>
                            </p>
                            <p>
                              {`Don't`} have an account?{' '}
                              <Link
                                href={`/components/pages/authentication/sign-up/`}
                              >
                                Create an Account
                              </Link>
                            </p>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
}
