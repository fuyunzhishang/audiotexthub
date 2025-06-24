export interface SpeechRecognitionSection {
  disabled?: boolean;
  label?: string;
  icon?: string;
  title: string;
  description: string;
  select_engine: string;
  select_engine_placeholder: string;
  click_to_record: string;
  recording: string;
  or: string;
  upload_audio: string;
  processing: string;
  latest_result: string;
  duration: string;
  history_title: string;
  no_history: string;
  text_file_prefix: string;
  error_messages?: {
    mic_permission?: string;
    recognition_failed?: string;
    invalid_format?: string;
    file_too_large?: string;
    file_too_long?: string;
  };
}