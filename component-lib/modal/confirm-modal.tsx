import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Tooltip,
  OverlayTrigger,
  Container,
} from 'react-bootstrap';

export function ConfirmModal(props: {
  show: boolean;
  setShow: any;
  fun: any;
  info: { title: string; body: any; buttonName: string };
}) {
  const { show, setShow, fun, info } = props;
  return (
    <Modal show={show}>
      <Modal.Header>
        <Modal.Title>{info.title}</Modal.Title>
        <Button
          variant=""
          className="btn btn-close"
          onClick={() => {
            setShow(false);
          }}
        >
          x
        </Button>
      </Modal.Header>
      <Modal.Body>
        <p>{info.body}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            setShow(false);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            fun();
          }}
        >
          {info.buttonName}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
