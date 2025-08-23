'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { FaHeart, FaRegHeart, FaThumbsDown, FaRegThumbsDown, FaEye, FaFlag } from 'react-icons/fa'
import DenunciaModal from './DenunciaModal'

interface ConteudoInteracoesProps {
  conteudoId: string
  conteudoParceiroId?: string
  tituloConteudo: string
  tipoConteudo: 'criador' | 'parceiro'
  visualizacoes: number
  curtidas: number
  dislikes: number
  onVisualizacaoChange?: (novasVisualizacoes: number) => void
  onCurtidaChange?: (novasCurtidas: number, curtido: boolean) => void
  onDislikeChange?: (novosDislikes: number, disliked: boolean) => void
}

export default function ConteudoInteracoes({
  conteudoId,
  conteudoParceiroId,
  tituloConteudo,
  tipoConteudo,
  visualizacoes,
  curtidas,
  dislikes,
  onVisualizacaoChange,
  onCurtidaChange,
  onDislikeChange
}: ConteudoInteracoesProps) {
  const [isCurtido, setIsCurtido] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [showDenunciaModal, setShowDenunciaModal] = useState(false)
  const [usuario, setUsuario] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Carregar dados do usuário
    const usuarioSalvo = localStorage.getItem('usuario-dados')
    if (usuarioSalvo) {
      try {
        const dadosUsuario = JSON.parse(usuarioSalvo)
        setUsuario(dadosUsuario)
      } catch (error) {
        console.error('Erro ao ler dados do usuário:', error)
      }
    }
  }, [])

  // Verificar estado inicial das interações do usuário
  useEffect(() => {
    if (usuario?.id) {
      verificarInteracoesUsuario()
    }
  }, [usuario, conteudoId, conteudoParceiroId, verificarInteracoesUsuario])

  // Registrar visualização quando o componente é montado
  useEffect(() => {
    if (usuario?.id) {
      registrarVisualizacao()
    }
  }, [usuario, conteudoId, conteudoParceiroId, registrarVisualizacao])

  const verificarInteracoesUsuario = useCallback(async () => {
    if (!usuario?.id) return
    
    try {
      const idParaUsar = tipoConteudo === 'parceiro' ? (conteudoParceiroId || conteudoId) : conteudoId
      
      // Verificar curtida
      const responseCurtida = await fetch(`/api/conteudos/${idParaUsar}/verificar-interacao?tipo=curtida&userId=${usuario.id}`)
      if (responseCurtida.ok) {
        const dataCurtida = await responseCurtida.json()
        setIsCurtido(dataCurtida.interagiu)
      }
      
      // Verificar dislike
      const responseDislike = await fetch(`/api/conteudos/${idParaUsar}/verificar-interacao?tipo=dislike&userId=${usuario.id}`)
      if (responseDislike.ok) {
        const dataDislike = await responseDislike.json()
        setIsDisliked(dataDislike.interagiu)
      }
    } catch (error) {
      console.error('Erro ao verificar interações do usuário:', error)
    }
  }, [usuario?.id, tipoConteudo, conteudoParceiroId, conteudoId])

  const registrarVisualizacao = useCallback(async () => {
    try {
      // Usar o ID correto baseado no tipo de conteúdo
      const idParaUsar = tipoConteudo === 'parceiro' ? (conteudoParceiroId || conteudoId) : conteudoId
      
      const response = await fetch(`/api/conteudos/${idParaUsar}/visualizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: usuario?.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (onVisualizacaoChange) {
          onVisualizacaoChange(data.visualizacoes)
        }
      }
    } catch (error) {
      console.error('Erro ao registrar visualização:', error)
    }
  }, [tipoConteudo, conteudoParceiroId, conteudoId, usuario?.id, onVisualizacaoChange])

  const handleCurtir = async () => {
    if (!usuario?.id) {
      alert('Você precisa estar logado para curtir conteúdo')
      return
    }

    try {
      // Usar o ID correto baseado no tipo de conteúdo
      const idParaUsar = tipoConteudo === 'parceiro' ? (conteudoParceiroId || conteudoId) : conteudoId
      
      const response = await fetch(`/api/conteudos/${idParaUsar}/curtir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: usuario.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIsCurtido(data.curtido)
        if (onCurtidaChange) {
          onCurtidaChange(data.curtidas, data.curtido)
        }
      }
    } catch (error) {
      console.error('Erro ao curtir/descurtir:', error)
    }
  }

  const handleDislike = async () => {
    if (!usuario?.id) {
      alert('Você precisa estar logado para dar dislike')
      return
    }

    try {
      // Usar o ID correto baseado no tipo de conteúdo
      const idParaUsar = tipoConteudo === 'parceiro' ? (conteudoParceiroId || conteudoId) : conteudoId
      
      const response = await fetch(`/api/conteudos/${idParaUsar}/dislike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: usuario.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIsDisliked(data.disliked)
        if (onDislikeChange) {
          onDislikeChange(data.dislikes, data.disliked)
        }
      }
    } catch (error) {
      console.error('Erro ao dar/remover dislike:', error)
    }
  }

  const formatarNumero = (numero: number) => {
    if (numero >= 1000000) {
      return (numero / 1000000).toFixed(1) + 'M'
    } else if (numero >= 1000) {
      return (numero / 1000).toFixed(1) + 'K'
    }
    return numero.toString()
  }

  return (
    <>
      <div className="flex items-center space-x-4 text-sm">
        {/* Visualizações */}
        <div className="flex items-center space-x-2 text-gray-400">
          <FaEye className="w-4 h-4" />
          <span>{formatarNumero(visualizacoes)}</span>
        </div>

        {/* Curtidas */}
        <button
          onClick={handleCurtir}
          className={`flex items-center space-x-2 transition-colors ${
            isCurtido ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
          title={isCurtido ? 'Remover curtida' : 'Curtir'}
        >
          {isCurtido ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
          <span>{formatarNumero(curtidas)}</span>
        </button>

        {/* Dislikes */}
        <button
          onClick={handleDislike}
          className={`flex items-center space-x-2 transition-colors ${
            isDisliked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
          }`}
          title={isDisliked ? 'Remover dislike' : 'Dar dislike'}
        >
          {isDisliked ? <FaThumbsDown className="w-4 h-4" /> : <FaRegThumbsDown className="w-4 h-4" />}
          <span>{formatarNumero(dislikes)}</span>
        </button>

        {/* Botão de Denúncia */}
        <button
          onClick={() => setShowDenunciaModal(true)}
          className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
          title="Denunciar conteúdo"
        >
          <FaFlag className="w-4 h-4" />
          <span className="hidden sm:inline">Denunciar</span>
        </button>
      </div>

      {/* Modal de Denúncia */}
      <DenunciaModal
        isOpen={showDenunciaModal}
        onClose={() => setShowDenunciaModal(false)}
        conteudoId={tipoConteudo === 'criador' ? conteudoId : undefined}
        conteudoParceiroId={tipoConteudo === 'parceiro' ? conteudoParceiroId || conteudoId : undefined}
        tituloConteudo={tituloConteudo}
        tipoConteudo={tipoConteudo}
      />
    </>
  )
}
