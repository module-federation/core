#!/bin/zsh
# You need po4a > 0.58, see https://github.com/mquinson/po4a/releases
# There is no need of system-wide installation of po4a
# Usage: PERLLIB=/path/to/po4a/lib make_pot.sh
# you may set following variables
# SRCDIR root of the documentation repository

####################################
# INITILIZE VARIABLES
####################################

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# root of the documentation repository
SRCDIR_MODULE="src/en/modules"

# place where the po files are
if [ -z "$PO_DIR" ] ; then
	PO_DIR="./src/l10n-weblate"
fi

####################################
# TEST IF IT CAN WORK
####################################

if [ ! -d "$SRCDIR_MODULE" ] ; then
    echo "Error, please check that SRCDIR match to the root of the documentation repository"
    echo "You specified modules are in $SRCDIR_MODULE"
    exit 1
fi

#######################################################################
# UPDATE/GENERATE .POT/.PO FILES WITHOUT GENERATING TRANSLATED ASCIIDOC
#######################################################################

for f in `ls $CURRENT_DIR/$PO_DIR/*.cfg`; do
    po4a -v --srcdir $CURRENT_DIR --destdir $CURRENT_DIR -k 0 -M utf-8 -L utf-8 --no-translations -o nolinting $f
done


###########################################
# COPY ENGLISH SCREENSHOTS TO EACH LANGUAGE
###########################################

#for module in $(find $CURRENT_DIR/$PO_DIR -mindepth 1 -maxdepth 1 -type d -printf "%f\n"); do
#    for langpo in $(find $CURRENT_DIR/$PO_DIR/$module -mindepth 1 -maxdepth 1 -type f -name "*.po" -printf "%f\n"); do
#        if [ -e $CURRENT_DIR/$SRCDIR_MODULE/$module/assets/images ]; then
#            lang=`basename $langpo .po`
#            rsync -u --inplace -a --delete $CURRENT_DIR/$SRCDIR_MODULE/$module/assets/* $CURRENT_DIR/$PO_DIR/$module/assets-$lang/
#        fi
#    done
#done
