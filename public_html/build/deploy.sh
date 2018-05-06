set +v
sh build.sh
STRPATH="../../deploy"
rm -r $STRPATH
mkdir $STRPATH
cp ../index.html $STRPATH
cp ../basic3d.css $STRPATH
cp ../basic3d.js $STRPATH
cp ../favicon.ico $STRPATH
mkdir $STRPATH/assets
mkdir $STRPATH/assets/models
mkdir $STRPATH/assets/texture
cp ../assets/texture/*.* $STRPATH/assets/texture/
