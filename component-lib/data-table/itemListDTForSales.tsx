import { Button, Divider, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  editItemAtom,
  editItemForSalesAtom,
  itemListAtom,
  itemListForSalesAtom,
  openPurItemDrawerAtom,
  openSalesItemDrawerAtom,
} from '@/stores/atom';
import DataTable from 'react-data-table-component';
import { Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
//
const customStylesForDataTable = {
  rows: {
    style: {
      '&:hover': {
        backgroundColor: '#f2f8ff', // 与你的CSS样式相同的颜色
      },
      paddingTop: '5px',
      paddingBottom: '5px',
      maxHeight: '400px', // 设置表格的最大高度
      overflowY: 'auto', // 当内容超出高度时显示垂直滚动条
    },
  },
};

const conditionalRowStyles = [
  // {
  //   //小于30%利润的商品
  //   when: (row: any) => {
  //     return row.price_base * 1.38 > parseFloat(row.item.lastest_sales_price);
  //   },
  //   style: {
  //     backgroundColor: '#ffebd6',
  //     //color: 'white',
  //     // '&:hover': {
  //     //   cursor: 'pointer',
  //     // },
  //   },
  // },
  {
    //退货的商品
    when: (row: any) => {
      return row.total.total < 0;
    },
    style: {
      backgroundColor: '#ffd1d1',
      //color: 'white',
      // '&:hover': {
      //   cursor: 'pointer',
      // },
    },
  },
  // {
  //   //赠品背景为浅绿
  //   when: (row: any) => row.is_promotional_item === true,
  //   style: {
  //     backgroundColor: '#e3fce9',
  //     //color: 'white',
  //     // '&:hover': {
  //     //   cursor: 'pointer',
  //     // },
  //   },
  // },
];

export default function ItemListDataTableForSales(props: any) {
  const { t } = useTranslation('sales_order');
  const [itemListDatas, setItemListDatas] = useAtom(itemListForSalesAtom);
  const [_edit, setEditItem] = useAtom(editItemForSalesAtom);
  const [_open, setOpenSalesItemDrawer] = useAtom(openSalesItemDrawerAtom);
  //
  const [deleteToggle, setDeleteToggle] = useState(false);
  //
  useEffect(() => {
    props.calculate();
  }, [deleteToggle]);
  

  //
  const columnsItemList = [
    {
      name: '#',
      width: '50px',
      selector: (row: any) => row.rowNumber,
      cell: (row: any, index: number) => {
        return (
          <span>
            {index + 1}
            <span className=" tx-white">
              <br></br>
              {row.sort_index}
            </span>
          </span>
        );

        // return ;
      }, // index 从 0 开始，所以加 1
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: t('dtlb_items'),
      width: '300px',
      selector: (row: any) => [row.item.plu],
      sortable: false,
      cell: (row: any, index: number) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setEditItem({ ...row, index });
            setOpenSalesItemDrawer(true);
          }}
        >
          {row.item ? (
            <Stack direction="vertical" gap={1}>
              {row.is_promotional_item && (
                <div className="wd-40">
                  <span className="badge bg-warning badge-pill me-1 ">
                    {t('dtlb_promotional')} - FREE
                  </span>
                </div>
              )}
              {row.total.total < 0 && (
                <span style={{ fontSize: 16, color: '#db1e29' }}>
                  =====RETURN=====
                </span>
              )}

              <span style={{ fontSize: 16 }}>{row.label}</span>
              <div>
                {row.item.barcode}
                {' SPEC: '}
                <span style={{ color: 'blue' }}>{row.item.spec}</span>
              </div>
              <div>
                {row?.promotional_source_items?.length > 0 &&
                  row.promotional_source_items.map((item: any) => (
                    <span className="badge bg-dark me-1 ">{item.label}</span>
                  ))}
              </div>
              <span style={{ color: 'blue' }}>{row.remark}</span>
            </Stack>
          ) : null}
        </div>
      ),
    },
    {
      name: t('dtlb_qty_sales'),
      width: '200px',
      selector: (row: any) => [row.qty_sales],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <Stack direction="vertical" gap={1}>
            <div>
              <span style={{ fontSize: 18 }}>{row.qty_sales}</span>
              <span className="mg-l-2"> x {row.sales_unit_id.name}</span>
            </div>
            <div style={{ color: 'gray' }}>
              <span> = {row.qty_base}</span>
              <span className="mg-l-2">x {row.base_unit_id.name}</span>
            </div>
            <div style={{ color: 'gray' }}>
              <span>
                1{row.sales_unit_id.name} = {`${row.exchange_rate}`}
              </span>
              <span className="mg-l-2"> {row.base_unit_id.name}</span>
            </div>
            {row.is_partial_received && (
              <Stack direction="vertical">
                <span className="badge bg-warning me-1">{t('dtlb_partial_received')}</span>
                <span> {t('dtlb_received_qty')} {row.received_qty}</span>
              </Stack>
            )}
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_unit_price'),
      width: '200px',
      selector: (row: any) => [row.price_sales],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <Stack direction="vertical" gap={1}>
            <div>
              <span style={{ fontSize: 18 }}>
                ${parseFloat(row.price_sales).toFixed(2)}
              </span>
              <span className="mg-l-2"> / {row.sales_unit_id.name}</span>
            </div>
            <div>
              {`(`}
              <span>${parseFloat(row.price_base).toFixed(2)}</span>
              <span className="mg-l-2">/ {row.base_unit_id.name}</span>
              {`)`}
            </div>

            {row.promotional_allocated_cost_sales &&
            row.promotional_allocated_cost_sales > 0 ? (
              <Stack>
                <Divider />
                <span>
                  {t('dtlb_cost')}: ${row.promotional_allocated_cost_sales.toFixed(2)}/{' '}
                  {row.sales_unit_id.name}
                </span>
                <span>
                  {t('dtlb_cost_unit')}: $
                  {(
                    row.promotional_allocated_cost_sales /
                    parseFloat(row.exchange_rate)
                  ).toFixed(2)}
                  / {row.base_unit_id.name}
                </span>
              </Stack>
            ) : null}
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_total'),
      width: '200px',
      selector: (row: any) => [row.tax_rate],
      sortable: false,
      cell: (row: any) => (
        <>
          {row.total && (
            <div className="">
              <Stack>
                <div className="d-flex flex-row-reverse">
                  {row.is_promotional_item ? (
                    <>
                      <span className={clsx('tx-16')}>{t('dtlb_total')}: 0</span>
                    </>
                  ) : (
                    <span className={clsx('tx-16 ')}>
                      {t('dtlb_total')}:
                      <span className="mg-l-6">
                        {row.total.total.toFixed(2)}
                      </span>
                    </span>
                  )}
                </div>{' '}
                {row.is_promotional_item && (
                  <div className="d-flex flex-row-reverse">
                    <del>
                      <span>
                        {t('dtlb_total')}:
                        <span className="mg-l-6">
                          {row.total.total.toFixed(2)}
                        </span>
                      </span>
                    </del>
                  </div>
                )}
                <div className="d-flex flex-row-reverse">
                  <span className="tx-gray-600">
                    {t('lb_subtotal')}:
                    <span className="mg-l-6">
                      {row.total.subtotal.toFixed(2)}
                    </span>
                  </span>
                </div>
                <div className="d-flex flex-row-reverse">
                  <span className="tx-gray-600">
                    {t('lb_tax')}:
                    <span className="mg-l-6">{row.total.tax.toFixed(2)}</span>
                  </span>
                </div>
              </Stack>
            </div>
          )}
        </>
      ),
    },
    {
      name: t('dtlb_op'),
      width: '6%',
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <IconButton
            color="warning"
            aria-label="Delete"
            onClick={() => {
              //赠品随便删除
              //如果不是赠品，判断是否使用过
              if (!row.is_promotional_item) {
                if (row.promotional_relationship_value_percentages > 0) {
                  toast.error(t('drawer_toast_promotional_delete'), {
                    position: 'top-center',
                    theme: 'colored',
                    autoClose: 8000,
                  });
                  return;
                }
              }

              const tempList = itemListDatas.filter((item) => {
                return item.row_uuid !== row.row_uuid;
              });

              setItemListDatas([...tempList]);
              setDeleteToggle(!deleteToggle);
            }}
          >
            <DeleteForever />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <span className="datatable">
      {itemListDatas?.length > 0 && (
        <DataTable
          title=""
          //@ts-ignore
          columns={columnsItemList}
          data={itemListDatas}
          fixedHeader
          pagination={false}
          customStyles={customStylesForDataTable}
          conditionalRowStyles={conditionalRowStyles}
        />
      )}
    </span>
  );
}
