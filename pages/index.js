'use client';
import React from 'react';
import Head from 'next/head';
import favicon from '../public/assets/img/brand/favicon.png';
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
import { useToken } from '@/lib/hooks/use-token';

export default function Home() {
  const router = useRouter();
  const { hasToken } = useToken();
  useEffect(() => {
    hasToken() ? router.push('/dashboard') : router.push('/login');
  }, [hasToken]);
  return <>loading...</>;
}
