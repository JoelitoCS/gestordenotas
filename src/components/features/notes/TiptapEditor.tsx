'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Image as TiptapImage } from '@tiptap/extension-image'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Bold, Italic, Heading2, List, ListOrdered, Highlighter, Image as ImageIcon, X } from 'lucide-react'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const supabase = createClient()
  const [hoveredImg, setHoveredImg] = useState<string | null>(null)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [isTouch, setIsTouch] = useState(false)
  const [images, setImages] = useState<{ src: string; alt: string }[]>([])

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      TiptapImage.configure({ inline: false, allowBase64: false }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Escribe algo...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      // Actualiza las imágenes en tiempo real
      const imgs: { src: string; alt: string }[] = []
      editor.state.doc.descendants(node => {
        if (node.type.name === 'image') {
          imgs.push({ src: node.attrs.src, alt: node.attrs.alt ?? '' })
        }
      })
      setImages(imgs)
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        'aria-label': 'Contenido de la nota',
        'aria-multiline': 'true',
        role: 'textbox',
      },
    },
  })

  useEffect(() => { return () => { editor?.destroy() } }, [editor])

  // Carga las imágenes iniciales cuando el editor se monta
  useEffect(() => {
    if (!editor) return
    const imgs: { src: string; alt: string }[] = []
    editor.state.doc.descendants(node => {
      if (node.type.name === 'image') {
        imgs.push({ src: node.attrs.src, alt: node.attrs.alt ?? '' })
      }
    })
    setImages(imgs)
  }, [editor])

  // Cierra lightbox con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setLightboxSrc(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  function deleteImageBySrc(src: string) {
    if (!editor) return
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'image' && node.attrs.src === src) {
        editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run()
        setHoveredImg(null)
        return false
      }
    })
  }

  async function handleImageUpload() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file || !editor) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('note-images').upload(path, file)
      if (error) { alert('Error al subir la imagen'); return }
      const { data: { publicUrl } } = supabase.storage.from('note-images').getPublicUrl(path)
      editor.chain().focus().setImage({ src: publicUrl }).run()
    }
    input.click()
  }



  if (!editor) return null

  const tools = [
    { icon: <Bold size={14} />, label: 'Negrita', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { icon: <Italic size={14} />, label: 'Cursiva', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { icon: <Heading2 size={14} />, label: 'Título', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    null,
    { icon: <List size={14} />, label: 'Lista', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: <ListOrdered size={14} />, label: 'Lista numerada', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    null,
    { icon: <Highlighter size={14} />, label: 'Resaltar', action: () => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run(), active: editor.isActive('highlight') },
    { icon: <ImageIcon size={14} />, label: 'Imagen', action: handleImageUpload, active: false },
  ]

  return (
    <div className="tiptap-wrap">
      {/* Toolbar */}
      <div className="tiptap-toolbar" role="toolbar" aria-label="Herramientas del editor">
        <label className="tool-btn" title="Color de texto" aria-label="Color de texto">
          <span style={{ fontWeight: 700, fontSize: 13, borderBottom: '2px solid currentColor', paddingBottom: 1 }}>A</span>
          <input type="color" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' }}
            onChange={e => editor.chain().focus().setColor(e.target.value).run()} aria-label="Color de texto" />
        </label>
        <div className="tool-sep" aria-hidden="true" />
        {tools.map((tool, i) =>
          tool === null
            ? <div key={`sep-${i}`} className="tool-sep" aria-hidden="true" />
            : <button key={tool.label} onClick={tool.action} className={`tool-btn ${tool.active ? 'active' : ''}`}
                aria-label={tool.label} aria-pressed={tool.active} title={tool.label} type="button">
                {tool.icon}
              </button>
        )}
      </div>

      {/* Imágenes */}
      {images.length > 0 && (
        <div className="img-preview-list" aria-label="Imágenes de la nota">
          {images.map((img, i) => (
            <div
              key={`${img.src}-${i}`}
              className="img-preview-wrap"
              onMouseEnter={() => setHoveredImg(img.src)}
              onMouseLeave={() => setHoveredImg(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt || 'Imagen de la nota'}
                className="img-preview"
                onClick={() => setLightboxSrc(img.src)}
                title="Clic para ver en tamaño completo"
              />
              {(isTouch || hoveredImg === img.src) && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); deleteImageBySrc(img.src) }}
                  className="img-delete-btn"
                  aria-label="Eliminar imagen"
                  title="Eliminar imagen"
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Editor texto */}
      <EditorContent editor={editor} />

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxSrc(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Imagen a tamaño completo"
        >
          <button
            className="lightbox-close"
            onClick={() => setLightboxSrc(null)}
            aria-label="Cerrar imagen"
          >
            <X size={18} strokeWidth={2} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt="Imagen a tamaño completo"
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <style>{`
        .tiptap-wrap { display: flex; flex-direction: column; }

        .tiptap-toolbar {
          display: flex; align-items: center; gap: 1px;
          padding: 8px 14px; border-bottom: 1px solid var(--border);
          flex-wrap: wrap; background: var(--surface);
        }
        .tool-btn {
          background: none; border: none; border-radius: 7px; padding: 6px 8px;
          color: var(--text-secondary); cursor: pointer; display: flex; align-items: center;
          justify-content: center; position: relative; transition: background .15s, color .15s; min-width: 30px;
        }
        .tool-btn:hover { background: var(--surface-2); color: var(--text-primary); }
        .tool-btn.active { background: rgba(0,113,227,0.12); color: var(--accent); }
        .tool-sep { width: 1px; height: 16px; background: var(--border); margin: 0 3px; flex-shrink: 0; }

        /* ── Previews de imágenes ── */
        .img-preview-list {
          display: flex; flex-wrap: wrap; gap: 10px;
          padding: 14px 16px; border-bottom: 1px solid var(--border);
          background: var(--surface);
        }
        .img-preview-wrap {
          position: relative;
          display: inline-block;
          flex-shrink: 0;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .img-preview {
          display: block;
          max-width: 200px;
          max-height: 160px;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 10px;
          cursor: pointer;
          transition: opacity .2s;
        }
        .img-preview-wrap:hover .img-preview { opacity: 0.88; }

        /* Botón eliminar — solo visible en hover */
        .img-delete-btn {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0,0,0,0.72);
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .15s, transform .15s;
          backdrop-filter: blur(4px);
          z-index: 10;
        }
        .img-delete-btn:hover {
          background: rgba(220,38,38,0.9);
          transform: scale(1.1);
        }

        /* ── Lightbox ── */
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          cursor: zoom-out;
          animation: fadeIn .2s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .lightbox-img {
          max-width: 90vw;
          max-height: 85vh;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 14px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
          cursor: default;
          animation: scaleIn .2s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes scaleIn { from { transform: scale(0.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        .lightbox-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .15s;
          backdrop-filter: blur(4px);
          z-index: 2001;
        }
        .lightbox-close:hover { background: rgba(255,255,255,0.25); }

        /* ── Editor ── */
        .tiptap-editor {
          padding: 16px 20px; min-height: 180px; outline: none;
          font-size: 15px; line-height: 1.65;
          color: var(--text-primary); background: var(--surface);
        }
        .tiptap-editor * { color: inherit; }
        .tiptap-editor p { margin-bottom: 8px; }
        .tiptap-editor p:last-child { margin-bottom: 0; }
        .tiptap-editor h2 { font-size: 18px; font-weight: 700; margin: 4px 0 10px; letter-spacing: -0.3px; }
        .tiptap-editor strong, .tiptap-editor em { color: var(--text-primary); }
        .tiptap-editor img { display: none; }
        .tiptap-editor ul { list-style-type: disc !important; padding-left: 22px !important; margin-bottom: 8px; }
        .tiptap-editor ul li { display: list-item !important; list-style-type: disc !important; margin-bottom: 3px; }
        .tiptap-editor ol { list-style-type: decimal !important; padding-left: 22px !important; margin-bottom: 8px; }
        .tiptap-editor ol li { display: list-item !important; list-style-type: decimal !important; margin-bottom: 3px; }
        .tiptap-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder); color: var(--text-muted);
          pointer-events: none; float: left; height: 0;
        }
      `}</style>
    </div>
  )
}
