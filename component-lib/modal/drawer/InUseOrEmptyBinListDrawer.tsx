import InUseOrEmptyBinListTable from '@/component-lib/data-table/InUseOrEmptyBinListDT';
import { useToken } from '@/lib/hooks/use-token';
import { openInUseOrEmptyBinListDrawerAtom } from '@/stores/atom';
import {
  Stack,
  Sheet,
  Box,
  Drawer,
  DialogTitle,
  DialogContent,
  ModalClose,
} from '@mui/joy';
import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { toastOptions } from '@/utils/public';

export default function InUseOrEmptyBinListDrawer(props: any) {
  // Values  -------------------------------------------------
  const { data, title, refetchOrder } = props;
  const { hasToken } = useToken();
  const routes = useRouter();
  // Auth ----------------------------------------------------
  useEffect(() => {
    if (!hasToken()) {
      routes.push('/login');
    }
  }, [hasToken()]);
  // Atoms ---------------------------------------------------
  const [open, setOpenInUseOrEmptyBinListDrawer] = useAtom(
    openInUseOrEmptyBinListDrawerAtom,
  );

  // UseState  -----------------------------------------------

  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------

  // Use Effect  ---------------------------------------------
 
  // Function ------------------------------------------------

 
  return (
    <React.Fragment>
      
      <Drawer
        anchor="right"
        size="md"
        variant="plain"
        open={open}
        onClose={(_, reason) => {
          setOpenInUseOrEmptyBinListDrawer(false);
        }}
        slotProps={{
          content: {
            sx: {
              bgcolor: 'transparent',
              p: { md: 3, sm: 0 },
              boxShadow: 'none',
            },
          },
        }}
      >
        <div className="ht-100p">
          <Sheet
            sx={{
              borderRadius: 'md',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: '100%',
              overflow: 'auto',
            }}
          >
            <DialogTitle>Bin - {title} </DialogTitle>
            <ModalClose />

            <DialogContent>
              <div className="pd-l-4 pd-r-4">
                {data && <InUseOrEmptyBinListTable data={data} />}
              </div>
            </DialogContent>
          </Sheet>
        </div>
      </Drawer>
    </React.Fragment>
  );
}
