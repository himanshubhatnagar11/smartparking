import React, { useEffect, useState } from "react";
import { Button, Row, Col, Card, Form, Image } from "react-bootstrap";
import { TOTAL_CAPACITY } from "./constants";
import { SignOut, addCar, searchCar, addUserDetails, getUserDetails, resetUserDetails, removeCar, addDefaultGeneralDetails, getVacantSlot, getParkingMatrix } from './Firebase';
import axios from 'axios';

const Home = ({ user }) => {

    const [vacantSlotMessage, setVacantSlotMessage] = useState('');
    const [parkingMatrix, setParkingMatrix] = useState('');
    const [parkPositionInput, setParkPositionInput] = useState('')
    const [parkRemovePositionInput, setParkRemovePositionInput] = useState('')
    const [searchCarInput, setSearchCarInput] = useState('');
    const [carSearchResult, setCarSearchResult] = useState('');
    const [userDetails, setUserDetails] = useState({})
    const [numberPlate, setNumberPlate] = useState('')
    const [mobile, setMobile] = useState('');
    const [inputFile, setInputFile] = useState(null);
    const [ocrData, setOcrData] = useState(null)

    const searchAndSetCarDetails = async () => {
        let res = await searchCar(searchCarInput);
        if (!res)
            setCarSearchResult('Not Found')
        else
            setCarSearchResult(`
            Car parked at position ${res[0].position + 1} and owned by ${res[0].displayName}
            `);
    }

    const fetchParkingMatrix = async () => {
        let pm = await getParkingMatrix();
        console.log({ pm })
        setParkingMatrix(pm);
    }

    const updateUserDetails = async () => {
        let ud = await getUserDetails();
        setUserDetails(ud);
    }

    useEffect(() => {
        fetchParkingMatrix();
        updateUserDetails();
    }, [])

    const getParkingSlot = async () => {
        let message = await getVacantSlot();
        console.log({ message })
        setVacantSlotMessage(message)
    }

    const parkCar = async (position) => {
        console.log({ position })
        await addCar(position - 1, userDetails.numberPlate);
        await fetchParkingMatrix();
    }

    const removeParkedCar = async (position) => {
        console.log({ position })
        await removeCar(position - 1);
        await fetchParkingMatrix();
    }

    const addAndUpdateUserDetails = async (numberPlate, mobile) => {
        await addUserDetails(numberPlate, mobile)
        updateUserDetails();
    }

    const initializeParkingCapacity = async () => {
        await addDefaultGeneralDetails();
        fetchParkingMatrix();
    }
    const resetAndFetchUserDetails = async () => {
        await resetUserDetails();
        updateUserDetails();
    }



    const callOCR = async () => {
        let url1 = 'https://api.openalpr.com/v3/recognize?secret_key=sk_a9d2b6322785a10519aee085&recognize_vehicle=0&country=in&return_image=0&topn=10&is_cropped=0'
        let bodyFormData = new FormData();
        bodyFormData.append('image', inputFile);
        axios({
            method: "post",
            url: url1,
            data: bodyFormData,
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then((response) => {
                //handle success
                let results = response.data?.results[0];
                setOcrData(results)
            })
            .catch((response) => {
                //handle error
                console.log({ response });
            });
    }

    return (
        <>
            {userDetails ?
                <>
                    <Row className='justify-content-center text-center mt-5'>

                        <Col xs={12} lg={4}>
                            <Card className='card' style={{ width: 'auto' }}>
                                <h1>User Details</h1>
                                <p>Name - {user.displayName}</p>
                                <p>Car Number - {userDetails.numberPlate}</p>
                                <p>Mobile Number - {userDetails.mobile}</p>
                                <Col>
                                    <Button onClick={() => resetAndFetchUserDetails()}>Reset Car Details</Button>
                                </Col>
                            </Card>
                        </Col>

                        <Col xs={12} lg={8}>
                            <Card className='card' style={{ width: 'auto' }}>
                                <Row>
                                    <h4 className='text-center'>Control Panel</h4>
                                </Row>
                                <Row className='my-5 justify-content-center text-center'>
                                    <Col>
                                        <Button className='m-2' onClick={() => getParkingSlot()} >Vacant Slot Generator</Button>
                                        {vacantSlotMessage && <p className='d-inline-block'>{vacantSlotMessage}</p>}
                                    </Col>
                                    <Col>
                                        <input value={searchCarInput} onChange={e => setSearchCarInput(e.target.value)} />
                                        <Button className='m-2' onClick={() => searchAndSetCarDetails()}>Search By Car</Button>
                                        {carSearchResult && <p>{carSearchResult}</p>}
                                    </Col>
                                </Row>

                                <Row className='my-5 justify-content-center text-center'>
                                    <Col>
                                        <input value={parkPositionInput} onChange={e => setParkPositionInput(e.target.value)} type='number' />
                                        <Button className='m-2' onClick={() => parkPositionInput && parkCar(parkPositionInput)} >Park Car</Button>
                                    </Col>
                                    <Col>
                                        <input value={parkRemovePositionInput} onChange={e => setParkRemovePositionInput(e.target.value)} type='number' />
                                        <Button className='m-2' onClick={() => parkRemovePositionInput && removeParkedCar(parkRemovePositionInput)} >Remove Car</Button>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Group controlId="formFile" className="mb-3">
                                            <Form.Label>Upload license plate for OCR</Form.Label>
                                            <Form.Control onChange={e => setInputFile(e.target.files[0])} type="file" />
                                        </Form.Group>
                                        <Button onClick={() => callOCR()}>Submit</Button>
                                    </Col>
                                    <Col className='m-4' xs={12}>
                                        {inputFile && <Image width={200} src={URL.createObjectURL(inputFile)} />}
                                    </Col>
                                    {ocrData && <>
                                        <p>Plate Number - {ocrData?.plate}</p>
                                        <p>Confidence - {ocrData.confidence}%</p>
                                    </>}
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                    <Row className='justify-content-center text-center mt-5'>
                        <Col>
                            <Card>
                                <h1>Map</h1>
                                {parkingMatrix}
                            </Card>
                            {/* <h4>Total Capacity = {TOTAL_CAPACITY}</h4> */}
                        </Col>
                    </Row>
                    {/* <Row className='my-5 justify-content-center text-center'>
                        <Col>
                            <Button onClick={() => addUserDetails('DL3C7336', '9999482736')}>Add User</Button>
                            <Button onClick={() => getUserDetails()}>Get User Details</Button>
                            <Button onClick={() => initializeParkingCapacity()}>Initialize Parking Matrix</Button>
                        </Col>
                    </Row> */}
                </>
                :
                <Row className='vh-100 justify-content-center'>
                    <Col xs={6} className='m-4'>
                        <Card className='card'>
                            <h5 className='text-center'>Enter Your Details</h5>
                            <input className='m-2' placeholder='Car Number' value={numberPlate} onChange={e => setNumberPlate(e.target.value)} />
                            <input className='m-2' placeholder='Mobile Number' value={mobile} onChange={e => setMobile(e.target.value)} />
                            <Button className='m-2' onClick={() => addAndUpdateUserDetails(numberPlate, mobile)}>Set Details</Button>
                        </Card>
                    </Col>
                </Row>
            }
        </>
    )
}

export default Home;