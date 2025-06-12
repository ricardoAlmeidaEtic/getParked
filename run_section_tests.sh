#!/bin/bash
# Este script executa todos os testes e gera um relatório detalhado com os outputs

# Cores para formatação do output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo -e "${YELLOW}================================================================${NC}"
echo -e "${YELLOW}                   GetParked - Relatório de Testes              ${NC}"
echo -e "${YELLOW}================================================================${NC}\n"
echo -e "${BLUE}Data: $(date)${NC}\n"

# Diretório do projeto
PROJECT_DIR="/home/msousa/etic/Projeto-Final-Final/getParked"
cd "$PROJECT_DIR"

# Função para executar teste e registrar resultado
run_test() {
  local test_file=$1
  local section_name=$2
  
  echo -e "\n${YELLOW}----------------------------------------------------------------${NC}"
  echo -e "${BLUE}=== Testando $section_name ===${NC}"
  echo -e "${YELLOW}----------------------------------------------------------------${NC}"
  
  # Executar o teste e capturar tanto a saída como o código de retorno
  npm test -- $test_file --silent
  local result=$?
  
  # Registrar resultado no sumário
  if [ $result -eq 0 ]; then
    echo -e "${GREEN}✓ $section_name: Todos os testes passaram${NC}"
    PASSED_TESTS=$((PASSED_TESTS+1))
  else
    echo -e "${RED}✗ $section_name: Alguns testes falharam${NC}"
    echo -e "${RED}  Verifique os erros acima para mais detalhes${NC}"
    FAILED_TESTS=$((FAILED_TESTS+1))
  fi
  
  TOTAL_TESTS=$((TOTAL_TESTS+1))
  echo
}

# Inicializar contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo -e "${YELLOW}Executando testes para todas as seções...${NC}\n"

# Executar os testes
run_test "landing.test.tsx" "Página Principal"
run_test "map.test.tsx" "Mapa"
run_test "profile.test.tsx" "Perfil"
run_test "planos.test.tsx" "Planos"
run_test "available-spots.test.tsx" "Vagas Disponíveis"
run_test "signin.test.tsx" "Login"
run_test "signup.test.tsx" "Registro"
run_test "forgot-password.test.tsx" "Recuperação de Senha"

# Relatório final
echo -e "\n${YELLOW}================================================================${NC}"
echo -e "${GREEN}                   RELATÓRIO COMPLETO                          ${NC}"
echo -e "${YELLOW}================================================================${NC}\n"

echo -e "${BLUE}Total de seções testadas:${NC} $TOTAL_TESTS"
echo -e "${GREEN}Seções com testes bem-sucedidos:${NC} $PASSED_TESTS"

if [ $FAILED_TESTS -gt 0 ]; then
  echo -e "${RED}Seções com testes falhados:${NC} $FAILED_TESTS"
  echo -e "\n${RED}Alguns testes apresentaram falhas. Verifique os logs acima para detalhes.${NC}"
  echo -e "${BLUE}Após corrigir os problemas, execute este script novamente.${NC}"
  echo -e "${YELLOW}Dica: Verifique se os mocks estão consistentes com as definições de interfaces.${NC}"
else
  echo -e "\n${GREEN}🎉 Todos os testes foram executados com sucesso!${NC}"
  echo -e "${BLUE}As seções do site estão funcionando conforme esperado.${NC}"
fi
