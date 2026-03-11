import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ language, value, onChange, theme = 'vs-dark' }) => {
    const handleEditorChange = (value) => {
        onChange(value);
    };

    const monacoLanguage = {
        'cpp': 'cpp',
        'java': 'java',
        'python': 'python'
    }[language] || 'cpp';

    return (
        <div className="flex-1 w-full h-full border-b border-gray-200 dark:border-gray-800">
            <Editor
                height="100%"
                language={monacoLanguage}
                value={value}
                theme={theme}
                onChange={handleEditorChange}
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    folding: true,
                    placeholder: "// Write your code here..."
                }}
            />
        </div>
    );
};

export default CodeEditor;
