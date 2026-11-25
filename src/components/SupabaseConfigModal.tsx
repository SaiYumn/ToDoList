import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  RefreshCw,
  X,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  onTestConnection: () => void;
  onResetTestData?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  isLoading,
  error,
  onTestConnection,
  onResetTestData,
}) => {
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);
  const configured = isSupabaseConfigured();

  if (!isOpen) return null;

  const sampleEnv = `VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-[2px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="supabase-modal-title"
    >
      <div
        className="kanso-elevated w-full max-w-[520px] rounded-[16px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E1E6DF] dark:border-[#27342F]">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#1F6F54] dark:text-[#4FB58C]" />
            <h2
              id="supabase-modal-title"
              className="text-[16px] font-semibold text-[#19211C] dark:text-[#E6EBE7]"
            >
              Supabase Connection & CRUD
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[10px] text-[#65776C] dark:text-[#7E9689] hover:text-[#19211C] dark:hover:text-[#E6EBE7]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-[12px] border flex items-start gap-3 ${
              isConnected
                ? 'bg-[#EAF5EF] dark:bg-[#152820] border-[#1F6F54]/30 text-[#1F6F54] dark:text-[#4FB58C]'
                : error
                ? 'bg-[#FDF2F2] dark:bg-[#2C1919] border-red-500/30 text-red-700 dark:text-red-300'
                : 'bg-[#F9FAF5] dark:bg-[#18221D] border-[#E1E6DF] dark:border-[#27342F] text-[#65776C] dark:text-[#7E9689]'
            }`}
          >
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="text-[13px] leading-[19px]">
              <p className="font-semibold text-[13.5px]">
                {isConnected
                  ? 'Connected to Supabase'
                  : configured
                  ? 'Connection Issue'
                  : 'Running in Local Storage Mode'}
              </p>
              <p className="mt-0.5">
                {isConnected
                  ? 'Full CRUD operations and real-time syncing are active on table "public.tasks".'
                  : error
                  ? error
                  : 'Add your Supabase project credentials to .env to enable cloud persistence & real-time sync across devices.'}
              </p>
            </div>
          </div>

          {/* Setup steps */}
          <div className="space-y-3 pt-2">
            <h3 className="text-[13px] font-semibold text-[#19211C] dark:text-[#E6EBE7]">
              How to Connect:
            </h3>

            <ol className="space-y-2.5 text-[13px] text-[#65776C] dark:text-[#7E9689] list-decimal pl-4">
              <li>
                <span className="text-[#19211C] dark:text-[#E6EBE7] font-medium">
                  Create a Supabase project
                </span>{' '}
                at{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1F6F54] dark:text-[#4FB58C] underline inline-flex items-center gap-1"
                >
                  supabase.com <ExternalLink className="w-3 h-3 inline" />
                </a>
              </li>

              <li>
                <span className="text-[#19211C] dark:text-[#E6EBE7] font-medium">
                  Run the SQL schema
                </span>
                : Go to{' '}
                <strong className="text-[#19211C] dark:text-[#E6EBE7]">SQL Editor</strong> in Supabase,
                open{' '}
                <code className="px-1.5 py-0.5 rounded bg-[#E1E6DF]/60 dark:bg-[#27342F] text-[12px] font-mono">
                  supabase/schema.sql
                </code>{' '}
                from this project, and click <em>Run</em>.
              </li>

              <li>
                <span className="text-[#19211C] dark:text-[#E6EBE7] font-medium">
                  Configure environment variables
                </span>
                : In your root{' '}
                <code className="px-1.5 py-0.5 rounded bg-[#E1E6DF]/60 dark:bg-[#27342F] text-[12px] font-mono">
                  .env
                </code>{' '}
                file, paste your project URL and anon public key:
              </li>
            </ol>

            {/* Code block */}
            <div className="relative rounded-[10px] bg-[#1B2420] text-[#E6EBE7] p-3 text-[12px] font-mono overflow-x-auto">
              <pre>{sampleEnv}</pre>
              <button
                type="button"
                onClick={handleCopyEnv}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-[#27342F] hover:bg-[#34443E] text-white/80 hover:text-white transition-colors"
                title="Copy snippet"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#E1E6DF] dark:border-[#27342F] bg-[#F8FAF5] dark:bg-[#161E1A] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTestConnection}
              disabled={isLoading}
              className="h-9 px-3 rounded-[10px] border border-[#E1E6DF] dark:border-[#27342F] bg-white dark:bg-[#1B2420] text-[13px] font-medium text-[#19211C] dark:text-[#E6EBE7] hover:border-[#1F6F54] dark:hover:border-[#4FB58C] inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Checking...' : 'Check Connection'}
            </button>

            {onResetTestData && (
              <button
                type="button"
                onClick={async () => {
                  setResetting(true);
                  try {
                    await onResetTestData();
                  } finally {
                    setResetting(false);
                  }
                }}
                disabled={resetting}
                className="h-9 px-3 rounded-[10px] border border-[#E1E6DF] dark:border-[#27342F] bg-white dark:bg-[#1B2420] text-[13px] font-medium text-[#19211C] dark:text-[#E6EBE7] hover:border-[#1F6F54] dark:hover:border-[#4FB58C] inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Populate database with clean CRUD test tasks"
              >
                <Database className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                {resetting ? 'Seeding...' : 'Reset Test Data'}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-[10px] bg-[#1F6F54] hover:bg-[#175440] dark:bg-[#4FB58C] dark:hover:bg-[#62C39C] text-white dark:text-[#121815] text-[13px] font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
