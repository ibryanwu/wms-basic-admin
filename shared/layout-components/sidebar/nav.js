import React from 'react';
import Stack from 'react-bootstrap/Stack';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import TuneIcon from '@mui/icons-material/Tune';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import MoveUpOutlinedIcon from '@mui/icons-material/MoveUpOutlined';
import { useTranslation } from 'next-i18next';

const ICON_SIZE = 'small'; //medium small
export const MENUITEMS = [
  {
    menutitle: 'main',
    Items: [
      {
        title: 'dashboard',
        icon: (
          <AssessmentOutlinedIcon
            fontSize={ICON_SIZE}
            style={{ marginRight: 4 }}
          />
        ),
        type: 'link',
        selected: true,
        active: true,
        path: `/dashboard`,
        permission: 'page.dashboard',
      },
      {
        title: 'inventory',
        icon: (
          <Inventory2OutlinedIcon
            fontSize={ICON_SIZE}
            style={{ marginRight: 4 }}
          />
        ),
        type: 'sub',
        selected: true,
        active: true,
        path: `/`,
        children: [
          {
            path: `/items`,
            type: 'link',
            active: false,
            selected: false,
            title: 'items',
            permission: 'page.items',
          },
          {
            path: `/report/inv-transactions`,
            type: 'link',
            active: false,
            selected: false,
            title: 'transactions',
            permission: 'page.report.inv-transactions',
          },
          {
            path: `/report/inventory-by-item`,
            type: 'link',
            active: false,
            selected: false,
            title: 'inventory_detail',
            permission: 'page.report.inventory-by-item',
          },
          {
            path: `/report/inventory-by-warehouse`,
            type: 'link',
            active: false,
            selected: false,
            title: 'by_warehouse',
            permission: 'page.report.inventory-by-warehouse',
          },
        ],
      },
      {
        title: 'inbound',
        icon: (
          <FormatIndentIncreaseIcon
            fontSize={ICON_SIZE}
            style={{ marginRight: 4 }}
          />
        ),
        type: 'sub',
        selected: true,
        active: true,
        path: `/inbound/order-list`,
        children: [
          {
            path: `/inbound/create`,
            type: 'link',
            active: false,
            selected: false,
            title: 'inbound_order',
            permission: 'page.inbound.create',
          },
          {
            path: `/inbound/order-list`,
            type: 'link',
            active: false,
            selected: false,
            title: 'order_list',
            permission: 'page.inbound.order-list',
          },
          {
            path: `/inbound/request-list`,
            type: 'link',
            active: false,
            selected: false,
            title: 'request_list',
            permission: 'page.inbound.request-list',
          },
        ],
      },
      {
        title: 'outbound',
        icon: (
          <FormatIndentDecreaseIcon
            fontSize={ICON_SIZE}
            style={{ marginRight: 4 }}
          />
        ),
        type: 'sub',
        selected: true,
        active: true,
        path: `/outbound/order-list`,
        children: [
          {
            path: `/outbound/create`,
            type: 'link',
            active: false,
            selected: false,
            title: 'outbound_order',
            permission: 'page.outbound.create',
          },
          {
            path: `/outbound/order-list`,
            type: 'link',
            active: false,
            selected: false,
            title: 'order_list',
            permission: 'page.outbound.order-list',
          },
          {
            path: `/outbound/picking-list`,
            type: 'link',
            active: false,
            selected: false,
            title: 'picking_list',
            permission: 'page.outbound.picking-list',
          },
          {
            path: `/outbound/request-list`,
            type: 'link',
            active: false,
            selected: false,
            title: 'request_list',
            permission: 'page.outbound.request-list',
          },
        ],
      },
      {
        title: 'transfer',
        icon: (
          <MoveUpOutlinedIcon fontSize={ICON_SIZE} style={{ marginRight: 4 }} />
        ),
        type: 'sub',
        selected: true,
        active: true,
        path: `/transfer-order/order-list`,
        children: [
          {
            path: `/transfer-order/create`,
            type: 'link',
            active: false,
            selected: false,
            title: 'transfer_order',
            permission: 'page.transfer-order.create',
          },
          {
            path: `/transfer-order/order-list`,
            type: 'link',
            active: false,
            selected: false,
            title: 'order_list',
            permission: 'page.transfer-order.order-list',
          },
        ],
      },
      {
        title: 'vendor_customer',
        icon: (
          <AssignmentIndOutlinedIcon
            fontSize={ICON_SIZE}
            style={{ marginRight: 4 }}
          />
        ),
        type: 'link',
        selected: false,
        active: false,
        path: `/vendor`,
        permission: 'page.vendor',
      },
      {
        title: 'warehouse',
        icon: <AcUnitIcon fontSize={ICON_SIZE} style={{ marginRight: 4 }} />,
        type: 'sub',
        selected: true,
        active: true,
        path: `/warehouse`,
        children: [
          {
            path: `/warehouse`,
            type: 'link',
            active: false,
            selected: false,
            title: 'warehouse',
            permission: 'page.warehouse',
          },
          {
            path: `/location`,
            type: 'link',
            active: false,
            selected: false,
            title: 'location',
            permission: 'page.location',
          },
        ],
      },
      {
        title: 'setting',
        icon: <TuneIcon fontSize={ICON_SIZE} style={{ marginRight: 4 }} />,
        type: 'sub',
        selected: true,
        active: true,
        children: [
          {
            path: `/category`,
            type: 'link',
            active: false,
            selected: false,
            title: 'category',
            permission: 'page.category',
          },

          {
            path: `/unit`,
            type: 'link',
            active: false,
            selected: false,
            title: 'unit',
            permission: 'page.unit',
          },
          {
            path: `/users`,
            type: 'link',
            active: false,
            selected: false,
            title: 'users',
            permission: 'page.users',
          },
          {
            path: `/role-permission`,
            type: 'link',
            active: false,
            selected: false,
            title: 'role_permission',
            permission: 'page.role.permission',
          },
        ],
      },
    ],
  },
];