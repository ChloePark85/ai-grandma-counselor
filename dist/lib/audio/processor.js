"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioProcessor = void 0;
// lib/audio/processor.ts
class AudioProcessor {
    constructor(onAudioData) {
        this.audioContext = null;
        this.mediaStream = null;
        this.processor = null;
        this.onAudioData = onAudioData;
    }
    floatTo16BitPCM(float32Array) {
        const buffer = new ArrayBuffer(float32Array.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        }
        return buffer;
    }
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    async startRecording() {
        try {
            // 1. 먼저 마이크 권한 요청
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 24000,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
            // 2. 마이크 권한이 승인되면 AudioContext 생성
            this.audioContext = new (window.AudioContext ||
                window.webkitAudioContext)();
            // 3. 오디오 처리 설정
            if (this.audioContext && this.mediaStream) {
                const source = this.audioContext.createMediaStreamSource(this.mediaStream);
                this.processor = this.audioContext.createScriptProcessor(1024, 1, 1);
                source.connect(this.processor);
                this.processor.connect(this.audioContext.destination);
                this.processor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    // 오디오 레벨 체크
                    const volume = inputData.reduce((sum, value) => sum + Math.abs(value), 0) /
                        inputData.length;
                    if (volume > 0.01) {
                        // 일정 볼륨 이상일 때만 전송
                        console.log("Audio detected, volume:", volume.toFixed(3));
                        const pcmData = this.floatTo16BitPCM(inputData);
                        const base64Audio = this.arrayBufferToBase64(pcmData);
                        this.onAudioData(base64Audio);
                    }
                };
            }
            else {
                throw new Error("Failed to initialize audio context or media stream");
            }
        }
        catch (error) {
            console.error("Error in startRecording:", error);
            // 리소스 정리
            this.stopRecording();
            // 에러 전파
            throw error instanceof Error
                ? error
                : new Error("Failed to start recording");
        }
    }
    stopRecording() {
        try {
            if (this.processor) {
                this.processor.disconnect();
                this.processor = null;
            }
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach((track) => track.stop());
                this.mediaStream = null;
            }
            if (this.audioContext) {
                if (this.audioContext.state !== "closed") {
                    this.audioContext.close();
                }
                this.audioContext = null;
            }
        }
        catch (error) {
            console.error("Error in stopRecording:", error);
        }
    }
}
exports.AudioProcessor = AudioProcessor;
