import React, { useRef, useState, useEffect } from "react"
import * as tf from "@tensorflow/tfjs"
import * as handpose from "@tensorflow-models/handpose"
import Webcam from "react-webcam"
import { drawHand } from "../components/handposeutil"
import * as fp from "fingerpose"
import Handsigns from "../components/handsigns"

import {
  Text,
  Heading,
  Button,
  Image,
  Stack,
  Container,
  Box,
  VStack,
  ChakraProvider,
} from "@chakra-ui/react"

import { Signimage, Signpass } from "../components/handimage"

import About from "../components/about"
import Metatags from "../components/metatags"

// import "../styles/App.css"

// import "@tensorflow/tfjs-backend-webgl"

import { RiCameraFill, RiCameraOffFill } from "react-icons/ri"

export default function Home() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)

  const [camState, setCamState] = useState("on")

  const [sign, setSign] = useState(null)
  
  let currentSign = 0

  let gamestate = "started"

  useEffect(() => {
    async function runHandpose() {
      const net = await handpose.load()
      console.log("Handpose model loaded.")
      setInterval(() => {
        detect(net)
      }, 150)
    }

    runHandpose()
  }, [])

  async function detect(net) {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video
      const videoWidth = webcamRef.current.video.videoWidth
      const videoHeight = webcamRef.current.video.videoHeight

      // Set video width
      webcamRef.current.video.width = videoWidth
      webcamRef.current.video.height = videoHeight

      // Set canvas height and width
      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight

      // Make Detections
      const hand = await net.estimateHands(video)

      if (hand.length > 0) {
        //loading the fingerpose model
        const GE = new fp.GestureEstimator([
          fp.Gestures.ThumbsUpGesture,
          Handsigns.aSign,
          Handsigns.bSign,
          Handsigns.cSign,
          Handsigns.dSign,
          Handsigns.eSign,
          Handsigns.fSign,
          Handsigns.gSign,
          Handsigns.hSign,
          Handsigns.iSign,
          Handsigns.jSign,
          Handsigns.kSign,
          Handsigns.lSign,
          Handsigns.mSign,
          Handsigns.nSign,
          Handsigns.oSign,
          Handsigns.pSign,
          Handsigns.qSign,
          Handsigns.rSign,
          Handsigns.sSign,
          Handsigns.tSign,
          Handsigns.uSign,
          Handsigns.vSign,
          Handsigns.wSign,
          Handsigns.xSign,
          Handsigns.ySign,
          Handsigns.zSign,
        ])

          const gesture = await GE.estimate(hand[0].landmarks, 4)

    if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
      const confidence = gesture.gestures.map((prediction) => prediction.confidence)
      const maxConfidence = confidence.indexOf(Math.max.apply(null, confidence))

      setSign(gesture.gestures[maxConfidence].name)

      if (gamestate === "started") {
        if (currentSign === 0) {
          currentSign = Math.floor(Math.random() * 26) + 1
        }
        if (gesture.gestures[maxConfidence].name === Handsigns[currentSign].name) {
          setSign("pass")
          currentSign = 0
        }
      }
    }

    // Draw mesh
    const ctx = canvasRef.current.getContext("2d")
    drawHand(hand, ctx)
  }
}
}

const toggleCam = () => {
setCamState(camState === "on" ? "off" : "on")
}

return (
<ChakraProvider>
<Metatags />
<Container maxW="container.lg">
<Stack spacing={8} align="center">
<Box bg="gray.100" w="100%" h="lg" position="relative">
<Webcam
ref={webcamRef}
style={{
position: "absolute",
top: 0,
left: 0,
right: 0,
bottom: 0,
}}
/>
<canvas
ref={canvasRef}
style={{
position: "absolute",
top: 0,
left: 0,
right: 0,
bottom: 0,
}}
/>
<Signimage sign={sign} />
<Signpass sign={sign} />
<Box
position="absolute"
bottom={4}
left={4}
onClick={() => toggleCam()}
cursor="pointer"
>
{camState === "on" ? <RiCameraOffFill size={32} /> : <RiCameraFill size={32} />}
</Box>
</Box>
<VStack spacing={4}>
<Heading size="lg">Can you sign it?</Heading>
<Text>Make the sign you see on the screen!</Text>
<Button onClick={() => (gamestate = "started")} colorScheme="green">
Start
</Button>
<Button onClick={() => (gamestate = "stopped")} colorScheme="red">
Stop
</Button>
</VStack>
<About />
</Stack>
</Container>
</ChakraProvider>
)
}
