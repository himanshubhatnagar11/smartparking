import React from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";

const Login = ({ SignInButton }) => {

    return (
        <Row className='vh-100 align-items-center'>
            <Col xs={{ span: 12, offset: 0 }} md={{ span: 4, offset: 4 }}>
                <Card className='px-4 py-5'>
                    <h4 className='text-center'>Login</h4>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" />
                            {/* <Form.Text className="text-muted">
                                We'll never share your email with anyone else.
                            </Form.Text> */}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicCheckbox">
                            <Form.Check type="checkbox" label="Remember me" />
                        </Form.Group>
                        <Form.Group>
                            <Button variant="primary" type="submit">Submit</Button>
                        </Form.Group>
                        <Form.Group>
                            <SignInButton />
                        </Form.Group>
                    </Form>
                </Card>
            </Col>
        </Row >

    );
}

export default Login;