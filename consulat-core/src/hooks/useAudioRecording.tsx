
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAudioRecording = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const { toast } = useToast();

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            toast({
                title: "Erreur microphone",
                description: "Impossible d'accéder au microphone",
                variant: "destructive"
            });
        }
    }, [toast]);

    const stopRecording = useCallback((): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!mediaRecorderRef.current) {
                reject('No recorder');
                return;
            }

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

                // Convert to base64
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    const base64Audio = (reader.result as string).split(',')[1];

                    try {
                        setIsTranscribing(true);
                        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                            body: { audio: base64Audio }
                        });

                        if (error) throw error;
                        resolve(data.text);
                    } catch (err: any) {
                        console.error('Transcription error:', err);
                        toast({
                            title: "Erreur transcription",
                            description: err.message,
                            variant: "destructive"
                        });
                        reject(err);
                    } finally {
                        setIsTranscribing(false);
                        setIsRecording(false);
                    }
                };
            };

            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        });
    }, [toast]);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            chunksRef.current = [];
        }
    }, []);

    return {
        isRecording,
        isTranscribing,
        startRecording,
        stopRecording,
        cancelRecording,
    };
};
