@echo off
chcp 65001 >nul
echo ========================================
echo   DIAGNÓSTICO GOOGLE PLAY BILLING
echo ========================================
echo.

echo [1/4] Verificando package name no app.json...
type app.json | findstr "package"
echo.

echo [2/4] Verificando assinatura do APK...
cd android
call gradlew signingReport
cd ..
echo.

echo [3/4] Package names configurados:
echo - app.json: Verifique acima
echo - Google Play Console: Você precisa verificar manualmente
echo.

echo [4/4] IDs de Produto buscados:
echo - Mensal: com.stoneativos.monitoraapp.monitora
echo - Trimestral: com.stoneativos.monitoraapp.monitora
echo - Anual: com.stoneativos.monitoraapp.stoneupplus
echo.

echo ========================================
echo   CHECKLIST
echo ========================================
echo.
echo [ ] 1. Package name no app.json é: com.stoneativos.monitoraapp
echo [ ] 2. App está publicado no Google Play Console (Internal Testing)
echo [ ] 3. Produtos criados no Console com IDs corretos
echo [ ] 4. Produtos estão com status "Ativo"
echo [ ] 5. Sua conta está na lista de testadores
echo [ ] 6. Você instalou o app da Play Store (não via ADB)
echo.

echo ========================================
echo   PRÓXIMOS PASSOS
echo ========================================
echo.
echo 1. Acesse: https://play.google.com/console
echo 2. Vá em "Monetização" → "Produtos" → "Assinaturas"
echo 3. Verifique se os produtos existem:
echo    - com.stoneativos.monitoraapp.monitora (com base plans: monitora-01, monitora-02)
echo    - com.stoneativos.monitoraapp.stoneupplus (com base plan: monitora-anual-01)
echo.
echo 4. Se os produtos não existem, você precisa criá-los
echo 5. Se existem, verifique se o package name está correto
echo.

pause
