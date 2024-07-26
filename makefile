# :map <F2> <Esc>:w<CR>:!run.sh<CR>
run:
	{ xdotool search --onlyvisible --classname Navigator windowactivate; sleep 0.1; xdotool key ctrl+r; }
